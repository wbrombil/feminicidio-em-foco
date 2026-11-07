# Snapshot da rede de proteção

`services.json` é um snapshot dos registros ativos da camada oficial da [IEDE/RS](https://iede.rs.gov.br/server/rest/services/SJCDH/locais_atendim_mulher_vitima_violencia/FeatureServer/0), consultada em `checkedAt`. A fonte declara que geolocaliza pontos a partir dos endereços, mas não informa data confiável da última edição. O projeto guarda a data da consulta e o nome da fonte informado em cada registro.

`contact-enrichments.json` reúne conferências complementares identificadas por ID IEDE. A fonte e a data de cada registro aplicam-se somente aos campos listados nele; os demais dados continuam atribuídos ao snapshot IEDE. O arquivo não altera o snapshot de origem e é carregado pela interface junto com ele. O importador pode regenerar `services.json` sem apagar essas conferências. Antes de incluir uma atualização, exija página pública oficial, registre a URL e a data da consulta e preserve os dados IEDE separados.

O snapshot contém CRMs, DEAMs, Delegacias de Proteção a Grupos Vulneráveis, PPPM, Salas das Margaridas, Salas Lilás, bases da Patrulha Maria da Penha, juizados, promotorias especializadas e postos médico-legais. Inclui apenas unidades com status ativo e código municipal IBGE correspondente à malha do projeto. A geometria de origem é usada somente quando há endereço público e coordenadas válidas. Uma conferência de endereço que diverge do endereço associado ao ponto invalida o uso daquele marcador até que a localização possa ser revalidada; o serviço permanece na lista textual.

Os 84 registros anteriores, consultados em 2 de novembro de 2026, foram preservados; 284 registros adicionais foram consultados em 7 de novembro de 2026. Dos 368 serviços, 366 têm pontos exibidos após aplicar as conferências de endereço. Um tem endereço público sem coordenada confirmada (a DEAM de Passo Fundo, cujo endereço oficial atual diverge do ponto IEDE) e um não tem endereço público. Esses dois serviços permanecem na lista textual. As geometrias novas são fornecidas pela IEDE e não foram conferidas individualmente. Endereços coincidentes mantêm serviços separados na lista.

## Limites conhecidos

- O recorte inclui 54 CRMs, 22 DEAMs, 7 DPGVs, 1 PPPM, 96 Salas das Margaridas, 9 Salas Lilás, 119 bases da Patrulha, 14 juizados, 12 promotorias especializadas e 34 postos médico-legais. O importador interrompe se essas quantidades mudarem, para exigir revisão antes de substituir o snapshot.
- Os postos médico-legais exigem encaminhamento da autoridade policial; o IGP recomenda telefonar antes para confirmar horários. [Fonte: IGP-RS](https://igp.rs.gov.br/onde-tem-posto-medico-legal). As promotorias exibidas são apenas as especializadas presentes neste recorte, não todas as unidades do MPRS.
- A fonte não declara municípios jurisdicionados da Patrulha Maria da Penha. Seus 119 registros ativos são bases/unidades associadas a municípios e não comprovam área atendida.
- Delegacias comuns não aparecem nesta camada com uma classificação que permita afirmar quais serviços prestam. Permanecem fora do mapa até haver fonte institucional adequada.
- Este GeoJSON de serviços é um retrato consultado em uma data e não atualização automática do navegador. Revise os dados e execute novamente o importador antes de incorporar alterações.
- A cópia de um e-mail em provedor gratuito, por si só, não prova que seja pessoal ou inválido. Na conferência de 3 de novembro de 2026, os 17 e-mails Gmail/Hotmail identificados no snapshot aparecem no [diretório oficial da Secretaria da Mulher do RS](https://mulher.rs.gov.br/centro-especializado-de-atendimento-a-mulher), incluindo o serviço de Sapucaia do Sul (ID 80). A publicação em diretório oficial confirma a associação divulgada, não a disponibilidade atual da caixa postal. O e-mail de Sapucaia é registrado como enriquecimento com fonte própria.
- Contatos complementares conferidos em fontes municipais/estaduais são mantidos em `contact-enrichments.json`; as fontes não substituem globalmente a IEDE.

## Regerar para revisão

```powershell
node .\scripts\import-protection-network.mjs
```

O comando não substitui um snapshot existente por padrão. Depois de conferir as diferenças e os valores publicados pela fonte, use `--replace` para gravar uma nova versão. A camada tem licença **CC BY-NC 4.0**; atribuição: Secretaria do Planejamento, Governança e Gestão do Estado do Rio Grande do Sul. O projeto é educativo e não comercial.
