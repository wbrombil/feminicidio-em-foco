[CmdletBinding()]
param(
    [string]$SourceArchive,
    [switch]$Replace
)

$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$outputDirectory = Join-Path $projectRoot 'src\data\ibge'
$outputPath = Join-Path $outputDirectory 'rs-municipios-2025.geojson'
$temporaryOutputPath = "$outputPath.tmp-$([guid]::NewGuid().ToString('N')).geojson"
$sourceUrl = 'https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/UFs/RS/RS_Municipios_2025.zip'
$downloadedArchivePath = $null

if ((Test-Path -LiteralPath $outputPath) -and -not $Replace) {
    throw "O arquivo de saída já existe; use -Replace somente após conferir a atualização: $outputPath"
}

if ([string]::IsNullOrWhiteSpace($SourceArchive)) {
    $downloadedArchivePath = Join-Path ([IO.Path]::GetTempPath()) "RS_Municipios_2025-$([guid]::NewGuid().ToString('N')).zip"
    Write-Host "Baixando a malha oficial do IBGE: $sourceUrl"
    Invoke-WebRequest -Uri $sourceUrl -OutFile $downloadedArchivePath -TimeoutSec 120
    $SourceArchive = $downloadedArchivePath
}
elseif (-not (Test-Path -LiteralPath $SourceArchive -PathType Leaf)) {
    throw "Arquivo fonte não encontrado: $SourceArchive"
}
else {
    $SourceArchive = (Resolve-Path -LiteralPath $SourceArchive).Path
}

if (-not (Test-Path -LiteralPath $outputDirectory -PathType Container)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$mapshaper = Join-Path $projectRoot 'node_modules\.bin\mapshaper.cmd'
if (-not (Test-Path -LiteralPath $mapshaper -PathType Leaf)) {
    throw 'Mapshaper não está instalado. Execute npm install antes de preparar a malha.'
}

try {
    & $mapshaper $SourceArchive `
        -target RS_Municipios_2025 `
        -filter 'CD_MUN != "4300001" && CD_MUN != "4300002"' `
        -simplify dp interval=50m keep-shapes `
        -filter-fields CD_MUN,NM_MUN,SIGLA_UF `
        -o format=geojson precision=0.00001 id-field=CD_MUN $temporaryOutputPath

    if ($LASTEXITCODE -ne 0) {
        throw "Mapshaper encerrou com código $LASTEXITCODE."
    }

    $validation = @'
const fs = require('node:fs');
const data = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
if (data.type !== 'FeatureCollection' || data.features.length !== 497) throw new Error('Esperadas 497 feições municipais.');
const codes = new Set();
for (const feature of data.features) {
  const properties = feature.properties || {};
  if (!/^43\d{5}$/.test(String(properties.CD_MUN))) throw new Error('Código municipal IBGE inválido.');
  if (feature.id !== String(properties.CD_MUN)) throw new Error('ID GeoJSON não corresponde ao código IBGE.');
  if (properties.SIGLA_UF !== 'RS' || !properties.NM_MUN) throw new Error('Atributos de município do RS inválidos.');
  if (!['Polygon', 'MultiPolygon'].includes(feature.geometry?.type)) throw new Error('Geometria municipal vazia ou inesperada.');
  if (codes.has(properties.CD_MUN)) throw new Error('Código IBGE duplicado.');
  codes.add(properties.CD_MUN);
}
console.log('GeoJSON válido: 497 municípios distintos do RS.');
'@
    & node -e $validation $temporaryOutputPath
    if ($LASTEXITCODE -ne 0) {
        throw 'A validação estrutural do GeoJSON falhou.'
    }

    if ($Replace -and (Test-Path -LiteralPath $outputPath -PathType Leaf)) {
        Move-Item -LiteralPath $temporaryOutputPath -Destination $outputPath -Force
    }
    else {
        [IO.File]::Move($temporaryOutputPath, $outputPath)
    }

    $hash = (Get-FileHash -LiteralPath $outputPath -Algorithm SHA256).Hash
    Write-Host "GeoJSON pronto: $outputPath"
    Write-Host "SHA-256: $hash"
}
finally {
    if (Test-Path -LiteralPath $temporaryOutputPath -PathType Leaf) {
        Remove-Item -LiteralPath $temporaryOutputPath -Force
    }
    if ($downloadedArchivePath -and (Test-Path -LiteralPath $downloadedArchivePath -PathType Leaf)) {
        Remove-Item -LiteralPath $downloadedArchivePath -Force
    }
}
