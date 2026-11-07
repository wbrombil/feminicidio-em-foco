# Malha municipal do Rio Grande do Sul

`rs-municipios-2025.geojson` contém as 497 feições municipais da Malha Municipal Digital 2025 do IBGE. A fonte original está publicada como Shapefile pelo [IBGE](https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/UFs/RS/RS_Municipios_2025.zip), em SIRGAS 2000 e coordenadas geográficas.

O arquivo fonte tem 499 feições. Foram excluídas as duas áreas estaduais operacionais atribuídas ao RS (`CD_MUN` `4300001` e `4300002`), que não são municípios. O GeoJSON mantém apenas código IBGE (`CD_MUN`), nome (`NM_MUN`) e sigla estadual (`SIGLA_UF`).

Para reduzir o peso no navegador, as geometrias foram simplificadas pelo Mapshaper com Douglas–Peucker e tolerância de 50 metros (`-simplify dp interval=50m keep-shapes`). O Mapshaper registrou a reparação de uma interseção durante a simplificação. Use esta camada para visualização temática; ela não substitui a malha integral para medições ou decisões de limite territorial.

## Regerar a malha

Com as dependências instaladas, execute no PowerShell:

```powershell
.\scripts\prepare-ibge-mesh.ps1
```

O script baixa o arquivo oficial para uma pasta temporária, exclui explicitamente os dois códigos de áreas operacionais, converte e valida as 497 feições. Por segurança, não substitui um GeoJSON existente sem `-Replace`.

## Correspondência com a SSP-RS

A SSP-RS publica o nome municipal, mas não o código IBGE nos JSONs anuais. `scripts/build-ibge-crosswalk.mjs` confere os 497 nomes de cada ano contra os nomes/códigos da geometria e gera `ssp-rs-municipality-crosswalk.json`. Correspondências são aceitas se o nome normalizado identificar exatamente um município. As cinco grafias divergentes da fonte SSP estão documentadas em `ssp-name-code-aliases.json` e associadas a códigos IBGE explícitos; correspondências ausentes, duplicadas ou ambíguas interrompem a geração.

Gere a tabela após preparar a geometria:

```powershell
node .\scripts\build-ibge-crosswalk.mjs
```

O processo valida todos os anos de 2020 a 2026 e não altera os números das planilhas. A camada e a tabela já são utilizadas pelo mapa; revise os aliases e a tabela gerada antes de publicar atualizações.
