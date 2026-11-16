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

## Complemento de outubro de 2026

O JSON anual original de 2026 permanece preservado, com janeiro–setembro (56 casos). `october-2026.json` registra a atualização de 5 de novembro: aba **Geral**, linha Feminicídio Consumado, outubro = 9 e acumulado = 65. O [balanço oficial de 12 de novembro](https://estado.rs.gov.br/rio-grande-do-sul-registra-queda-nos-crimes-violentos-em-outubro) também confirma os nove casos de outubro.

A aba municipal da mesma planilha soma 37 e diverge do resumo; foi descartada para esta atualização. O importador cruza as duas abas e bloqueia divergências antes da escrita. `-WhatIf` valida e informa a intenção de gravação, mas não imprime uma prévia dos dados.

O carregador compartilhado combina a base preservada e o complemento sem modificar os JSONs oficiais. `coverage.availableMonths` representa o período estadual; `municipalCompleteMonths` identifica janeiro–setembro e `complementaryMonths` identifica outubro. Em outubro, somente municípios com evidência recebem contagem; os demais permanecem `null`. O total municipal acumulado é o subtotal confirmado, e não uma distribuição exaustiva dos 65 casos estaduais.

Consulta em 16/11/2026: cinco incrementos de uma unidade (Alegrete, Barra do Guarita, Porto Alegre, Caxias do Sul e Erechim). Cada registro complementar possui identificador editorial estável, data da ocorrência, fonte, URL e justificativa; esse identificador não é um registro individual da SSP-RS. O índice de notícias referencia o mesmo identificador em `supplementId`. Uma reportagem pode sustentar ocorrências distintas; URL igual não implica duplicidade, nem URLs diferentes comprovam casos distintos. A revisão humana deve conferir as ocorrências antes de acrescentá-las.

Não foram atribuídos a outubro os casos ainda condicionais localizados em Sapucaia do Sul e Porto Alegre, nem uma ocorrência de Venâncio Aires cuja data de morte não foi comprovada. Restam quatro casos do agregado sem atribuição municipal nesta camada; não foram inventados nem convertidos em zeros. A classificação utilizada é a explicitada pelas fontes consultadas, sujeita a revisão; não representa condenação judicial.

Para nova atualização, revise as evidências e as referências editoriais e execute `node --experimental-strip-types --test --test-isolation=none scripts/annual-data.test.mjs`, `npm run build` e `npm run lint`. Uma futura base oficial consistente deve substituir a composição por uma atualização própria, removendo o complemento para evitar dupla contagem.

## Referências jornalísticas de 2026

`case-news-2026.json` é um índice editorial complementar, não uma base oficial de ocorrências. Os dados de janeiro a setembro vêm do arquivo anual da SSP-RS; outubro usa o complemento documentado acima, preservando a unidade município/mês. As referências exibidas não são cartões de casos e não comprovam correspondência um a um com os registros agregados. Os links apontam para as reportagens originais. A interface exibe o título editorial, o veículo e o link; nomes de vítimas e referências a bairros ou endereços são omitidos dos títulos apresentados para preservar a privacidade.

Cada referência mantém `publishedAt` como data editorial original confirmada em formato `AAAA-MM-DD`. Quando a fonte só apresenta uma data de atualização, uma edição semanal ou nenhuma data, `publishedAt` fica `null`; `publicationDateDisplay` e `publicationDateNote` explicam a informação disponível. `dateForOrdering` usa a data publicada quando confirmada e, nas exceções, uma data substituta claramente identificada (início da edição ou atualização), para manter a ordenação cronológica sem rotulá-la como publicação original. `publicationDateEvidence` registra o texto/indício observado na fonte. Datas não indicam o dia em que a ocorrência aconteceu.

O arquivo contém 43 referências editoriais para consulta (42 URLs distintas), organizados pelo recorte de município e mês. Na revisão editorial de 3 de novembro de 2026, quatro referências foram retiradas porque as próprias reportagens ainda não sustentavam suficientemente a classificação; a retirada não significa que nenhuma notícia exista. Um link inacessível foi substituído por outra reportagem aberta sobre o mesmo recorte municipal e mensal. Esses links não podem ser subtraídos dos totais da SSP-RS para inferir quantos registros têm ou não cobertura jornalística: a planilha não oferece identificadores individuais e uma reportagem pode tratar de mais de uma ocorrência. Por isso, a interface não gera cartões “sem notícia” a partir da diferença entre contagens.

As referências remanescentes foram conferidas quanto à relação descrita na reportagem com município e mês. Essa revisão editorial não prova correspondência individual com registros da SSP-RS. O campo `title` guarda o título apresentado na interface, com ajustes editoriais para omitir nomes de vítimas e referências a bairros ou endereços. Antes de publicar ou atualizar o índice, confira novamente cada página de origem, preserve a URL original e aplique o mesmo cuidado editorial ao título. Quando a relação com o recorte não for clara, não inclua a referência; nunca preencha lacunas por inferência.
