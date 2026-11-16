[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$InputDirectory = (Join-Path $env:USERPROFILE 'Downloads\feminicidiors'),
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\src\data\ssp-rs\generated'),
    [int[]]$Year,
    [switch]$Replace
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

$script:SpreadsheetNamespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
$script:RelationshipsNamespace = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
$script:PackageRelationshipsNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships'
$script:SourcePage = 'https://www.ssp.rs.gov.br/indicadores-da-violencia-contra-a-mulher'
$script:MonthLabels = @('Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez')

function Read-ZipXml {
    param(
        [System.IO.Compression.ZipArchive]$Archive,
        [string]$EntryName
    )

    $entry = $Archive.GetEntry($EntryName)
    if ($null -eq $entry) {
        throw "O arquivo XLSX não contém a entrada esperada '$EntryName'."
    }

    $reader = [System.IO.StreamReader]::new($entry.Open())
    try {
        $document = [System.Xml.XmlDocument]::new()
        $document.XmlResolver = $null
        $document.LoadXml($reader.ReadToEnd())
        return $document
    }
    finally {
        $reader.Dispose()
    }
}

function Get-CellValue {
    param(
        [System.Xml.XmlElement]$Row,
        [string]$Reference,
        [string[]]$SharedStrings,
        [System.Xml.XmlNamespaceManager]$NamespaceManager
    )

    $cell = $Row.SelectSingleNode("./m:c[@r='$Reference']", $NamespaceManager)
    if ($null -eq $cell) { return $null }

    if ($cell.GetAttribute('t') -eq 'inlineStr') {
        $inlineText = $cell.SelectNodes('./m:is//m:t', $NamespaceManager)
        return (($inlineText | ForEach-Object { $_.InnerText }) -join '')
    }

    $valueNode = $cell.SelectSingleNode('./m:v', $NamespaceManager)
    if ($null -eq $valueNode -or [string]::IsNullOrWhiteSpace($valueNode.InnerText)) {
        return $null
    }

    if ($cell.GetAttribute('t') -eq 's') {
        $index = [int]$valueNode.InnerText
        if ($index -lt 0 -or $index -ge $SharedStrings.Length) {
            throw "Índice de texto compartilhado inválido na célula '$Reference'."
        }
        return $SharedStrings[$index]
    }

    return $valueNode.InnerText
}

function ConvertTo-NonnegativeInteger {
    param(
        [object]$Value,
        [string]$Context
    )

    if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) {
        throw "Valor ausente onde se esperava um número inteiro: $Context."
    }

    $number = [decimal]0
    $valid = [decimal]::TryParse(
        [string]$Value,
        [System.Globalization.NumberStyles]::Number,
        [System.Globalization.CultureInfo]::InvariantCulture,
        [ref]$number
    )
    if (-not $valid -or $number -lt 0 -or $number -ne [decimal]::Truncate($number)) {
        throw "Valor inválido '$Value' em $Context; esperava-se um inteiro não negativo."
    }

    return [long]$number
}

function Read-WorkbookData {
    param(
        [System.IO.FileInfo]$File,
        [int]$WorkbookYear
    )

    $yearInFileName = [regex]::Match($File.Name, '(?:mulheres|municipio)-(?<year>20\d{2})(?:-|\.|$)')
    if (-not $yearInFileName.Success -or [int]$yearInFileName.Groups['year'].Value -ne $WorkbookYear) {
        throw "O nome do arquivo '$($File.Name)' não confirma o ano $WorkbookYear."
    }

    $archive = [System.IO.Compression.ZipFile]::OpenRead($File.FullName)
    try {
        $workbook = Read-ZipXml -Archive $archive -EntryName 'xl/workbook.xml'
        $relationships = Read-ZipXml -Archive $archive -EntryName 'xl/_rels/workbook.xml.rels'

        $workbookNamespaces = [System.Xml.XmlNamespaceManager]::new($workbook.NameTable)
        $workbookNamespaces.AddNamespace('m', $script:SpreadsheetNamespace)
        $workbookNamespaces.AddNamespace('r', $script:RelationshipsNamespace)

        $relationshipNamespaces = [System.Xml.XmlNamespaceManager]::new($relationships.NameTable)
        $relationshipNamespaces.AddNamespace('p', $script:PackageRelationshipsNamespace)

        $sheet = $workbook.SelectSingleNode(
            "/m:workbook/m:sheets/m:sheet[@name='Feminicídio Consumado']",
            $workbookNamespaces
        )
        if ($null -eq $sheet) {
            throw "A aba 'Feminicídio Consumado' não foi encontrada em '$($File.Name)'."
        }

        $relationshipId = $sheet.GetAttribute('id', $script:RelationshipsNamespace)
        $relationship = $relationships.SelectSingleNode(
            "/p:Relationships/p:Relationship[@Id='$relationshipId']",
            $relationshipNamespaces
        )
        if ($null -eq $relationship) {
            throw "Não foi possível resolver a relação da aba de feminicídio em '$($File.Name)'."
        }

        $worksheetPath = $relationship.GetAttribute('Target').Replace('\', '/')
        if ($worksheetPath.StartsWith('/')) {
            $worksheetPath = $worksheetPath.TrimStart('/')
        }
        elseif (-not $worksheetPath.StartsWith('xl/')) {
            $worksheetPath = "xl/$worksheetPath"
        }

        $sharedStrings = @()
        if ($null -ne $archive.GetEntry('xl/sharedStrings.xml')) {
            $sharedStringsDocument = Read-ZipXml -Archive $archive -EntryName 'xl/sharedStrings.xml'
            $sharedNamespaces = [System.Xml.XmlNamespaceManager]::new($sharedStringsDocument.NameTable)
            $sharedNamespaces.AddNamespace('m', $script:SpreadsheetNamespace)
            $sharedStrings = @(
                foreach ($item in $sharedStringsDocument.SelectNodes('/m:sst/m:si', $sharedNamespaces)) {
                    $textNodes = $item.SelectNodes('.//m:t', $sharedNamespaces)
                    ($textNodes | ForEach-Object { $_.InnerText }) -join ''
                }
            )
        }

        $worksheet = Read-ZipXml -Archive $archive -EntryName $worksheetPath
        $worksheetNamespaces = [System.Xml.XmlNamespaceManager]::new($worksheet.NameTable)
        $worksheetNamespaces.AddNamespace('m', $script:SpreadsheetNamespace)
        $rows = $worksheet.SelectNodes('/m:worksheet/m:sheetData/m:row', $worksheetNamespaces)

        $headerRow = $null
        foreach ($row in $rows) {
            $municipalityHeader = Get-CellValue -Row $row -Reference "B$($row.GetAttribute('r'))" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            if ([string]$municipalityHeader -eq 'Município') {
                $headerRow = $row
                break
            }
        }
        if ($null -eq $headerRow) {
            throw "Cabeçalho de municípios não encontrado em '$($File.Name)'."
        }

        for ($monthIndex = 0; $monthIndex -lt 12; $monthIndex++) {
            $column = [char]([int][char]'C' + $monthIndex)
            $headerValue = Get-CellValue -Row $headerRow -Reference "$column$($headerRow.GetAttribute('r'))" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            if ([string]$headerValue -ne $script:MonthLabels[$monthIndex]) {
                throw "Cabeçalho mensal inesperado em '$($File.Name)' na coluna ${column}: '$headerValue'."
            }
        }

        $totalHeaderColumn = 'O'
        $totalHeader = Get-CellValue -Row $headerRow -Reference "$totalHeaderColumn$($headerRow.GetAttribute('r'))" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
        if ([string]$totalHeader -ne 'Total') {
            throw "Coluna de total inesperada em '$($File.Name)': '$totalHeader'."
        }

        $aggregateRow = $null
        $aggregateRowIndex = 0
        foreach ($row in $rows) {
            if ([int]$row.GetAttribute('r') -le [int]$headerRow.GetAttribute('r')) { continue }
            $rowLabel = Get-CellValue -Row $row -Reference "B$($row.GetAttribute('r'))" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            if ([string]$rowLabel -eq 'Geral') {
                $aggregateRow = $row
                $aggregateRowIndex = [int]$row.GetAttribute('r')
                break
            }
        }
        if ($null -eq $aggregateRow) {
            throw "Linha agregada 'Geral' não encontrada em '$($File.Name)'."
        }

        $municipalities = [System.Collections.Generic.List[object]]::new()
        $seenMunicipalities = @{}
        foreach ($row in $rows) {
            $rowIndex = [int]$row.GetAttribute('r')
            if ($rowIndex -le [int]$headerRow.GetAttribute('r') -or $rowIndex -ge $aggregateRowIndex) { continue }

            $municipalityValue = Get-CellValue -Row $row -Reference "B$rowIndex" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            if ($null -eq $municipalityValue -or [string]::IsNullOrWhiteSpace([string]$municipalityValue)) { continue }

            $municipality = ([string]$municipalityValue).Trim()
            $key = $municipality.ToUpperInvariant()
            if ($seenMunicipalities.ContainsKey($key)) {
                throw "Município duplicado '$municipality' em '$($File.Name)'."
            }
            $seenMunicipalities[$key] = $true

            $monthlyValues = [ordered]@{}
            $monthlySum = [long]0
            for ($monthIndex = 0; $monthIndex -lt 12; $monthIndex++) {
                $monthNumber = $monthIndex + 1
                $column = [char]([int][char]'C' + $monthIndex)
                $rawValue = Get-CellValue -Row $row -Reference "$column$rowIndex" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
                if ($null -eq $rawValue -or [string]::IsNullOrWhiteSpace([string]$rawValue)) {
                    $monthlyValues[('{0:D2}' -f $monthNumber)] = $null
                }
                else {
                    $number = ConvertTo-NonnegativeInteger -Value $rawValue -Context "$($File.Name), $municipality, mês $monthNumber"
                    $monthlyValues[('{0:D2}' -f $monthNumber)] = $number
                    $monthlySum += $number
                }
            }

            $rawTotal = Get-CellValue -Row $row -Reference "O$rowIndex" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            $total = ConvertTo-NonnegativeInteger -Value $rawTotal -Context "$($File.Name), $municipality, total"
            if ($total -ne $monthlySum) {
                throw "O total de '$municipality' ($total) diverge da soma dos meses disponíveis ($monthlySum) em '$($File.Name)'."
            }

            $municipalities.Add([pscustomobject][ordered]@{
                municipality = $municipality
                months = $monthlyValues
                total = $total
            })
        }

        if ($municipalities.Count -ne 497) {
            throw "Esperadas 497 linhas municipais em '$($File.Name)'; encontradas $($municipalities.Count)."
        }

        $availableMonths = [System.Collections.Generic.List[int]]::new()
        for ($monthIndex = 0; $monthIndex -lt 12; $monthIndex++) {
            $monthKey = '{0:D2}' -f ($monthIndex + 1)
            $presentCount = @($municipalities | Where-Object { $null -ne $_.months[$monthKey] }).Count
            if ($presentCount -eq $municipalities.Count) {
                $availableMonths.Add($monthIndex + 1)
            }
            elseif ($presentCount -ne 0) {
                throw "O mês $monthKey tem valores ausentes em parte dos municípios de '$($File.Name)'."
            }
        }
        if ($availableMonths.Count -eq 0) {
            throw "Nenhum mês municipal publicado foi encontrado em '$($File.Name)'."
        }

        $aggregateMonths = [ordered]@{}
        $aggregateTotal = ConvertTo-NonnegativeInteger -Value (Get-CellValue -Row $aggregateRow -Reference "O$aggregateRowIndex" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces) -Context "$($File.Name), Geral, total"
        for ($monthIndex = 0; $monthIndex -lt 12; $monthIndex++) {
            $monthNumber = $monthIndex + 1
            $monthKey = '{0:D2}' -f $monthNumber
            $column = [char]([int][char]'C' + $monthIndex)
            $rawValue = Get-CellValue -Row $aggregateRow -Reference "$column$aggregateRowIndex" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            $aggregateMonthValue = ConvertTo-NonnegativeInteger -Value $rawValue -Context "$($File.Name), Geral, mês $monthNumber"
            if ($availableMonths.Contains($monthNumber)) {
                $municipalMonthSum = [long]0
                foreach ($municipality in $municipalities) { $municipalMonthSum += [long]$municipality.months[$monthKey] }
                if ($municipalMonthSum -ne $aggregateMonthValue) {
                    throw "O total municipal do mês $monthKey ($municipalMonthSum) diverge da linha Geral ($aggregateMonthValue) em '$($File.Name)'."
                }
                $aggregateMonths[$monthKey] = $aggregateMonthValue
            }
            else {
                $aggregateMonths[$monthKey] = $null
            }
        }

        $municipalityTotalSum = [long]0
        foreach ($municipality in $municipalities) { $municipalityTotalSum += [long]$municipality.total }
        if ($municipalityTotalSum -ne $aggregateTotal) {
            throw "A soma dos totais municipais ($municipalityTotalSum) diverge da linha Geral ($aggregateTotal) em '$($File.Name)'."
        }

        # A linha Geral da aba municipal não substitui o resumo estadual da aba Geral.
        $summarySheet = $workbook.SelectSingleNode(
            "/m:workbook/m:sheets/m:sheet[@name='Geral']", $workbookNamespaces
        )
        if ($null -eq $summarySheet) {
            throw "A aba 'Geral' não foi encontrada para conferir o resumo estadual em '$($File.Name)'."
        }
        $summaryRelationshipId = $summarySheet.GetAttribute('id', $script:RelationshipsNamespace)
        $summaryRelationship = $relationships.SelectSingleNode(
            "/p:Relationships/p:Relationship[@Id='$summaryRelationshipId']", $relationshipNamespaces
        )
        if ($null -eq $summaryRelationship) {
            throw "Não foi possível resolver a relação da aba Geral em '$($File.Name)'."
        }
        $summaryPath = $summaryRelationship.GetAttribute('Target').Replace('\', '/')
        if ($summaryPath.StartsWith('/')) { $summaryPath = $summaryPath.TrimStart('/') }
        elseif (-not $summaryPath.StartsWith('xl/')) { $summaryPath = "xl/$summaryPath" }
        $summary = Read-ZipXml -Archive $archive -EntryName $summaryPath
        $summaryNamespaces = [System.Xml.XmlNamespaceManager]::new($summary.NameTable)
        $summaryNamespaces.AddNamespace('m', $script:SpreadsheetNamespace)
        $summaryRows = $summary.SelectNodes('/m:worksheet/m:sheetData/m:row', $summaryNamespaces)
        $summaryIndicatorRow = $null
        $summaryHeaderRow = $null
        foreach ($row in $summaryRows) {
            $rowIndex = $row.GetAttribute('r')
            $label = Get-CellValue -Row $row -Reference "B$rowIndex" -SharedStrings $sharedStrings -NamespaceManager $summaryNamespaces
            if ([string]$label -eq 'Feminicídio Consumado') { $summaryIndicatorRow = $row }
            $firstMonth = Get-CellValue -Row $row -Reference "C$rowIndex" -SharedStrings $sharedStrings -NamespaceManager $summaryNamespaces
            if ([string]$firstMonth -eq 'Jan') { $summaryHeaderRow = $row }
        }
        if ($null -eq $summaryIndicatorRow -or $null -eq $summaryHeaderRow) {
            throw "Cabeçalho mensal ou indicador 'Feminicídio Consumado' ausente na aba Geral de '$($File.Name)'."
        }
        $summaryIndex = $summaryIndicatorRow.GetAttribute('r')
        $differences = [System.Collections.Generic.List[string]]::new()
        $summarySum = [long]0
        for ($monthIndex = 0; $monthIndex -lt 12; $monthIndex++) {
            $monthKey = '{0:D2}' -f ($monthIndex + 1)
            $column = [char]([int][char]'C' + $monthIndex)
            $header = Get-CellValue -Row $summaryHeaderRow -Reference "$column$($summaryHeaderRow.GetAttribute('r'))" -SharedStrings $sharedStrings -NamespaceManager $summaryNamespaces
            if ([string]$header -ne $script:MonthLabels[$monthIndex]) {
                throw "Cabeçalho mensal inesperado na aba Geral de '$($File.Name)', coluna ${column}: '$header'."
            }
            $rawValue = Get-CellValue -Row $summaryIndicatorRow -Reference "$column$summaryIndex" -SharedStrings $sharedStrings -NamespaceManager $summaryNamespaces
            $summaryValue = $null
            if ($null -ne $rawValue -and -not [string]::IsNullOrWhiteSpace([string]$rawValue)) {
                $summaryValue = ConvertTo-NonnegativeInteger -Value $rawValue -Context "$($File.Name), aba Geral, Feminicídio Consumado, mês $monthKey"
                $summarySum += $summaryValue
            }
            $municipalValue = $aggregateMonths[$monthKey]
            if (($null -eq $summaryValue) -ne ($null -eq $municipalValue) -or $summaryValue -ne $municipalValue) {
                $stateLabel = if ($null -eq $summaryValue) { 'indisponível' } else { [string]$summaryValue }
                $municipalLabel = if ($null -eq $municipalValue) { 'indisponível' } else { [string]$municipalValue }
                $differences.Add("mês ${monthKey}: resumo estadual=$stateLabel, municipal=$municipalLabel")
            }
        }
        $summaryTotal = ConvertTo-NonnegativeInteger -Value (Get-CellValue -Row $summaryIndicatorRow -Reference "O$summaryIndex" -SharedStrings $sharedStrings -NamespaceManager $summaryNamespaces) -Context "$($File.Name), aba Geral, Feminicídio Consumado, total"
        if ($summaryTotal -ne $summarySum) {
            throw "O total estadual ($summaryTotal) diverge da soma dos meses publicados ($summarySum) na aba Geral de '$($File.Name)'."
        }
        if ($summaryTotal -ne $aggregateTotal) {
            $differences.Add("total: resumo estadual=$summaryTotal, municipal=$aggregateTotal")
        }
        if ($differences.Count -gt 0) {
            throw "Importação bloqueada: divergência entre a aba Geral (Feminicídio Consumado) e o detalhamento municipal em '$($File.Name)': $($differences -join '; '). Dados existentes preservados."
        }

        $sourceUpdatedAt = $null
        foreach ($row in $rows) {
            $rowLabel = Get-CellValue -Row $row -Reference "B$($row.GetAttribute('r'))" -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
            if ([string]$rowLabel -match '^Fonte:.*Atualizado em\s+(\d{1,2})/(\d{1,2})/(\d{4})') {
                $day = [int]$Matches[1]
                $month = [int]$Matches[2]
                $year = [int]$Matches[3]
                $sourceUpdatedAt = [datetime]::new($year, $month, $day).ToString('yyyy-MM-dd')
                break
            }
        }
        if ($null -eq $sourceUpdatedAt) {
            throw "Data de atualização da fonte não encontrada em '$($File.Name)'."
        }

        $titleRow = $rows | Where-Object { [int]$_.GetAttribute('r') -eq 2 } | Select-Object -First 1
        $title = Get-CellValue -Row $titleRow -Reference 'B2' -SharedStrings $sharedStrings -NamespaceManager $worksheetNamespaces
        if ([string]$title -notmatch "\b$WorkbookYear\b") {
            throw "O título da aba não confirma o ano $WorkbookYear em '$($File.Name)'."
        }

        return [pscustomobject]@{
            year = $WorkbookYear
            sourceFile = $File.Name
            sourceUpdatedAt = $sourceUpdatedAt
            availableMonths = @($availableMonths)
            statewideMonths = $aggregateMonths
            statewideTotal = $aggregateTotal
            municipalities = @($municipalities)
        }
    }
    finally {
        $archive.Dispose()
    }
}

if (-not (Test-Path -LiteralPath $InputDirectory -PathType Container)) {
    throw "Pasta de entrada não encontrada: $InputDirectory"
}

if ($null -eq $Year -or $Year.Count -eq 0) {
    $Year = @(2020..2026)
}
foreach ($requestedYear in $Year) {
    if ($requestedYear -lt 2020 -or $requestedYear -gt 2026) {
        throw "Ano fora do escopo: $requestedYear. Escolha um ano de 2020 a 2026."
    }
}

$files = @(Get-ChildItem -LiteralPath $InputDirectory -File -Filter '*.xlsx')
$workbooks = [System.Collections.Generic.List[object]]::new()
foreach ($requestedYear in $Year) {
    $matches = @($files | Where-Object { $_.Name -match "(?:mulheres|municipio)-$requestedYear(?:-|\.)" })
    if ($matches.Count -ne 1) {
        throw "Esperado exatamente um XLSX para $requestedYear em '$InputDirectory'; encontrados $($matches.Count)."
    }
    $workbooks.Add((Read-WorkbookData -File $matches[0] -WorkbookYear $requestedYear))
}

$outputPath = [System.IO.Path]::GetFullPath($OutputDirectory)
$pendingWrites = [System.Collections.Generic.List[object]]::new()
foreach ($workbook in $workbooks) {
    $fileName = "feminicidio-consumado-$($workbook.year).json"
    $destination = Join-Path $outputPath $fileName
    if ((Test-Path -LiteralPath $destination) -and -not $Replace) {
        throw "O arquivo já existe e será preservado: $destination. Use -Year $($workbook.year) -Replace somente para uma atualização revisada."
    }

    $document = [pscustomobject][ordered]@{
        schemaVersion = 1
        year = $workbook.year
        indicator = 'feminicidio-consumado'
        source = [pscustomobject][ordered]@{
            publisher = 'SSP-RS'
            title = 'Indicadores da Violência Contra a Mulher - Lei Maria da Penha'
            url = $script:SourcePage
            file = $workbook.sourceFile
            updatedAt = $workbook.sourceUpdatedAt
        }
        coverage = [pscustomobject][ordered]@{
            availableMonths = @($workbook.availableMonths)
            unavailableMonthValue = $null
        }
        statewide = [pscustomobject][ordered]@{
            months = $workbook.statewideMonths
            total = $workbook.statewideTotal
        }
        municipalities = @($workbook.municipalities)
    }

    $json = ConvertTo-Json -InputObject $document -Depth 8
    $pendingWrites.Add([pscustomobject]@{
        destination = $destination
        json = $json
    })
}

if ($pendingWrites.Count -eq 0) { return }

if ($Replace -and $pendingWrites.Count -ne 1) {
    throw 'Para substituir dados existentes, selecione um único ano com -Year AAAA -Replace.'
}

if ((Test-Path -LiteralPath $outputPath -PathType Container) -and $pendingWrites.Count -gt 1) {
    throw "A pasta de saída já existe. Gere ou atualize um ano por vez para preservar os demais arquivos: $outputPath"
}

if (-not $PSCmdlet.ShouldProcess($outputPath, "Gerar $($pendingWrites.Count) arquivo(s) JSON a partir de planilhas SSP-RS")) {
    return
}

$outputParent = Split-Path -Parent $outputPath
if (-not (Test-Path -LiteralPath $outputParent -PathType Container)) {
    New-Item -ItemType Directory -Path $outputParent -Force | Out-Null
}

$stagingDirectory = $null
$stagedFiles = [System.Collections.Generic.List[object]]::new()
try {
    $isInitialBatch = $pendingWrites.Count -gt 1
    if ($isInitialBatch) {
        $stagingDirectory = "$outputPath.tmp-$([guid]::NewGuid().ToString('N'))"
        New-Item -ItemType Directory -Path $stagingDirectory | Out-Null
    }
    elseif (-not (Test-Path -LiteralPath $outputPath -PathType Container)) {
        $stagingDirectory = "$outputPath.tmp-$([guid]::NewGuid().ToString('N'))"
        New-Item -ItemType Directory -Path $stagingDirectory | Out-Null
    }

    foreach ($write in $pendingWrites) {
        $finalDirectory = if ($null -ne $stagingDirectory) { $stagingDirectory } else { $outputPath }
        if (-not (Test-Path -LiteralPath $finalDirectory -PathType Container)) {
            New-Item -ItemType Directory -Path $finalDirectory | Out-Null
        }
        $fileName = [System.IO.Path]::GetFileName($write.destination)
        $finalPath = Join-Path $finalDirectory $fileName
        $temporaryPath = "$finalPath.tmp-$([guid]::NewGuid().ToString('N'))"
        $stagedFiles.Add([pscustomobject]@{
            temporary = $temporaryPath
            destination = $finalPath
        })
        [System.IO.File]::WriteAllText($temporaryPath, $write.json, [System.Text.UTF8Encoding]::new($false))
    }

    foreach ($stagedFile in $stagedFiles) {
        if ($Replace) {
            Move-Item -LiteralPath $stagedFile.temporary -Destination $stagedFile.destination -Force
        }
        else {
            Move-Item -LiteralPath $stagedFile.temporary -Destination $stagedFile.destination
        }
    }

    if ($null -ne $stagingDirectory) {
        Move-Item -LiteralPath $stagingDirectory -Destination $outputPath
        $stagingDirectory = $null
    }

    foreach ($write in $pendingWrites) { Write-Host "Gerado: $($write.destination)" }
}
finally {
    foreach ($stagedFile in $stagedFiles) {
        if (Test-Path -LiteralPath $stagedFile.temporary -PathType Leaf) {
            Remove-Item -LiteralPath $stagedFile.temporary -Force
        }
    }
    if ($null -ne $stagingDirectory -and (Test-Path -LiteralPath $stagingDirectory -PathType Container)) {
        foreach ($write in $pendingWrites) {
            $stagedDestination = Join-Path $stagingDirectory ([System.IO.Path]::GetFileName($write.destination))
            if (Test-Path -LiteralPath $stagedDestination -PathType Leaf) {
                Remove-Item -LiteralPath $stagedDestination -Force
            }
        }
        Remove-Item -LiteralPath $stagingDirectory
    }
}

Write-Host "Validação concluída para $($pendingWrites.Count) ano(s); fonte de entrada preservada."

