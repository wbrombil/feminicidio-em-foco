# Dados municipais da SSP-RS

Os arquivos em `generated/feminicidio-consumado-AAAA.json` contêm a contagem mensal de feminicídios consumados por município, extraída da aba **Feminicídio Consumado** das planilhas anuais da SSP-RS.

## Estrutura

- `schemaVersion`: versão deste formato de dados.
- `source`: órgão, página oficial, nome do arquivo de origem e data de atualização indicada na planilha.
- `coverage.availableMonths`: números dos meses com dados municipais publicados.
- `coverage.unavailableMonthValue`: `null`; campos mensais sem publicação também são representados como `null`.
- `statewide`: totais mensais e anual publicados na linha agregada `Geral`.
- `municipalities`: nome como publicado pela SSP-RS, contagens nos meses `01` a `12` e total municipal.

O número `0` representa zero publicado pela fonte. `null` significa que o valor não está disponível. Os nomes municipais são preservados como aparecem na planilha; ela não fornece o código IBGE necessário para associação geográfica.

## Atualização

As planilhas originais ficam fora do projeto, em `C:\Users\<usuário>\Downloads\feminicidiors`. Para conferir uma atualização antes de gravar:

```powershell
& '.\scripts\import-ssp.ps1' -Year 2026 -Replace -WhatIf
```

Depois de conferir o arquivo e a prévia, gere apenas o ano revisado:

```powershell
& '.\scripts\import-ssp.ps1' -Year 2026 -Replace
```

Na primeira geração, sem `-Year`, o importador processa 2020–2026 e prepara os sete arquivos antes de mover a pasta de saída. Depois, atualize um ano por vez com `-Year AAAA -Replace`; sem essa opção, arquivos existentes são preservados. Confira a prévia usando `-WhatIf -Replace` antes de atualizar. A validação verifica a estrutura, a identidade única dos 497 municípios, valores inteiros não negativos, soma dos meses versus total municipal e consistência dos totais municipais com a linha `Geral`. Se houver divergência, não grava a saída. A conferência humana continua necessária antes de incorporar uma atualização ao site.

Fonte: [SSP-RS — Indicadores da Violência Contra a Mulher](https://www.ssp.rs.gov.br/indicadores-da-violencia-contra-a-mulher).

## Referências jornalísticas de 2026

`case-news-2026.json` é um índice editorial complementar, não uma base oficial de ocorrências. Os totais e a unidade município/mês continuam vindo do arquivo anual da SSP-RS. As referências exibidas não são cartões de casos e não comprovam correspondência um a um com os registros agregados. Conforme a decisão editorial do projeto, os links apontam para as reportagens originais mesmo quando elas mencionam detalhes identificadores; a interface exibe o veículo e o link, sem copiar nomes, imagens ou detalhes da reportagem para o site.

Cada referência mantém `publishedAt` como data editorial original confirmada em formato `AAAA-MM-DD`. Quando a fonte só apresenta uma data de atualização, uma edição semanal ou nenhuma data, `publishedAt` fica `null`; `publicationDateDisplay` e `publicationDateNote` explicam a informação disponível. `dateForOrdering` usa a data publicada quando confirmada e, nas exceções, uma data substituta claramente identificada (início da edição ou atualização), para manter a ordenação cronológica sem rotulá-la como publicação original. `publicationDateEvidence` registra o texto/indício observado na fonte. Datas não indicam o dia em que a ocorrência aconteceu.

O arquivo contém 38 links editoriais para consulta, organizados pelo recorte de município e mês. Na revisão editorial de 3 de novembro de 2026, quatro referências foram retiradas porque as próprias reportagens ainda não sustentavam suficientemente a classificação; a retirada não significa que nenhuma notícia exista. Um link inacessível foi substituído por outra reportagem aberta sobre o mesmo recorte municipal e mensal. Esses links não podem ser subtraídos dos totais da SSP-RS para inferir quantos registros têm ou não cobertura jornalística: a planilha não oferece identificadores individuais e uma reportagem pode tratar de mais de uma ocorrência. Por isso, a interface não gera cartões “sem notícia” a partir da diferença entre contagens.

As referências remanescentes foram conferidas quanto à relação descrita na reportagem com município e mês. Essa revisão editorial não prova correspondência individual com registros da SSP-RS. Antes de publicar ou atualizar o índice, confira novamente cada página de origem e preserve a URL original. Quando a relação com o recorte não for clara, não inclua a referência; nunca preencha lacunas por inferência.
