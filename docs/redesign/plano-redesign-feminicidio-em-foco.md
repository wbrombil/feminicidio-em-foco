# Plano de redesign — Feminicídio em Foco

Atualizado em 7 de novembro de 2026 (America/Sao_Paulo). Documento de continuidade e de decisão; não é declaração de entrega concluída.

## Estado e próximo passo

- Etapa atual: direção A aplicada à página inteira; revisão independente e verificações integradas realizadas com pendências descritas abaixo.
- Interface: cabeçalho, abertura, contexto, explorador, notícias, educação, apoio, metodologia e tabelas usam linguagem editorial. Logo e arquivos de dados preservados. O componente de notícias recebeu apenas importação de CSS; conteúdo e lógica preservados.
- Próximo passo exato: avaliar a versão em http://localhost:5173/ e realizar teste com leitor de tela em ambiente interativo. Para aceite integral, revisar combinações/estados ainda não cobertos, contraste não textual e alvos do mapa após carregamento completo. Não publicar.
- Servidor existente: `http://localhost:5173/`, resposta HTTP 200 confirmada. Não foi iniciado outro servidor.
- Arquivo solicitado: `C:\Users\wesle\Downloads\plano-redesign-feminicidio-em-foco.md`. Criado com a autorização já fornecida pelo usuário; existência e igualdade de hash com a cópia do projeto verificadas. Manter as duas cópias sincronizadas ao fim de cada etapa, com a mesma revisão. Antes de atualizar Downloads, ler sua versão e preservar edições concorrentes.

## Objetivo, escopo e limites

Criar uma linguagem visual própria, séria, humana e editorial, melhorando hierarquia, composição, tipografia, espaçamento, navegação, dados e responsividade. Implementação incremental no código atual, após escolha do usuário e inspeção inicial; piloto aguarda avaliação.

Preservar literalmente textos, números, fontes, links, notas, avisos, créditos, módulos e funcionalidades; conteúdo deve permanecer acessível na interface, inclusive estados após interações. Não resumir ou reescrever para acomodar layout. Não adicionar dados, notícias, imagens ou depoimentos fictícios. Necessidades editoriais vão para registro separado, sem aplicação silenciosa.

Logo imutável em arquivo, desenho, tipografia, cor e proporção. Ajustes autorizados: tamanho proporcional e posicionamento, com respiro e legibilidade. Sem recorte, filtro CSS, recoloração, reconstrução ou troca de asset.

Preservar arquitetura React/TypeScript/Vite, CSS próprio, Leaflet/React Leaflet, dependências e contratos de dados. Sem instalações, scaffold, atualizações de base, publicação, deploy, commit, reset, stash ou descarte de trabalho. Sem esconder módulos adicionais em abas, carrosséis ou expansões para limpar a aparência.

## Evidências técnicas e estado local

Raiz confirmada: `C:\Projetos\feminicidio-em-foco`. Worktree único informado por `git worktree list`; branch `main`, HEAD `18421d6f12f5cbd549ae74d57cc27ec776012377`.

Instruções: política AGENTS.md fornecida pelo usuário nesta conversa. Nenhum AGENTS.md encontrado nos caminhos de raiz/ancestrais consultados e nas árvores src/public. Skills consultadas: auditoria-escopo, dor, diamante-duplo, cascata e fluxo local de Sites. Usar pdca/DoD nas próximas fases de implementação e aceite.

Antes deste trabalho: `src/App.tsx` e `src/App.css` modificados, sem alterações staged observadas. Diff inicial: 65 linhas envolvidas no TSX e 16 no CSS; total 75 adições e 6 remoções. Inclui cinco tópicos educativos expansíveis, definição legal e links ampliados, cartilha TJRS/CEVID e atendimento em Libras. Esses acréscimos pertencem ao baseline, não ao redesign. `cntx.txt` é ignorado e foi preservado sem reprodução. `dist/`, `node_modules/` e arquivos locais ignorados não foram limpos nem regenerados.

Baseline persistido em `docs/redesign/baseline-2026-11-06/`:

- `manifest.json`: SHA-256 e tamanho de 36 arquivos de src/public e entradas de build.
- `App.tsx.original.txt` e `App.css.original.txt`: cópias byte a byte; igualdade dos hashes confirmada.
- `alteracoes-preexistentes.patch`: diff para consulta; cópias originais são a evidência de bytes.
- Capturas da interface e estados amostrados: disponíveis na subpasta `capturas/`. Manifesto de arquivos não substitui evidência visual nem comportamental.

Hashes principais:

| Arquivo | SHA-256 inicial |
| --- | --- |
| public/logo-feminicidio-em-foco-horizontal.svg | 036C264C89A6AAD153CA4BDA31A8F2A2A24795F424BF3167E555A4C27D407DB3 |
| public/logo-feminicidio-em-foco-compacto.svg | B2FEF56D74A695A7163B005CB977AA7BE8FE2797398DD5398D5E822F1198606A |
| src/App.tsx | D96983DB693A7BA6EA2CC7D0D28DD7C4FA497247C3212090F452EC80C8061D73 |
| src/App.css | DB50C013885DA8C3D7C4AF57DB07A90DB6469D3E2B350E6731CDF2117D01E03D |

O SVG horizontal tem viewBox 1350 × 310, com imagem embutida; o arquivo real é a autoridade. O PNG existente `docs/identidade-visual/horizontal-preview.png` foi visualizado para reconhecer a marca; não foi confundido com captura da página atual.

Fluxo: `index.html` → `src/main.tsx` (StrictMode, Analytics existente) → `App.tsx` → `MapExplorer`, `LatestCaseNews`, sete instâncias de `AnnualDataDialog`. Estilos: `src/index.css`, `src/App.css`, `src/components/map/MapExplorer.css` e CSS Leaflet existente. Conteúdo servido por arquivos locais importados com `?url`; nenhum backend de aplicação identificado nesse fluxo.

Comandos e verificações:

| Item | Situação real |
| --- | --- |
| node --version / npm --version | Executados: v24.21.0 / 11.19.0 |
| npm run dev | Script Vite confirmado no package.json; servidor já existente responde em localhost:5173. Não relançado nesta sessão |
| npm run lint | Executado no baseline; oxlint terminou com exit code 0 |
| npm run build | Script `tsc -b && vite build` confirmado; não executado nesta etapa para não regenerar dist existente |
| npm run preview | Script `vite preview` confirmado; não executado |
| git status/diff, HEAD, branch, worktree | Consultados; revalidar antes de qualquer edição |
| git submodule status | Falhou no ambiente Git/sh com erro de criação de signal pipe (Win32 5); ausência de submódulos não foi validada por esse comando |
| Get-NetTCPConnection | Acesso negado; não foi usado como evidência de portas |
| Browser/desktop/celular/console/performance | Chrome headless instalado executado com perfil temporário após solicitação explícita; capturas e estados descritos abaixo. Não houve erros de console capturados nos percursos. Desempenho, zoom e leitor de tela não medidos |

## Diagnóstico inicial: fatos e hipóteses

Fatos do código: identidade atual usa papel quente, texto escuro, acento vinho, Arial/Helvetica e vários tokens já existentes. Contêiner chega a 1760px; abertura tem altura mínima até 480px e CTA com posicionamento absoluto em desktop; notícia usa grade de cinco colunas e proporção de cartão; textos de leitura usam token de 0.9rem. Há diferentes breakpoints para mapa, notícias, educação e tabela anual. O mapa contém cores hardcoded além dos tokens globais. Não há gráfico temporal neste fluxo: há resumo numérico, coroplético, detalhes e tabelas anuais.

Hipóteses a verificar na tela: abertura pode afastar dados sem acrescentar contexto proporcional; repetição de grades pode nivelar conteúdos de funções diferentes; leitura extensa pode beneficiar-se de largura menor e corpo maior; CTA absoluto pode aproximar-se do texto em larguras intermediárias. Não são defeitos visualmente comprovados nem resultados de pesquisa de usuários.

Pontos a investigar em acessibilidade: marcadores de 18/22px exigem avaliação de alvo/espaçamento/exceções; polígonos canvas precisam de alternativa textual equivalente; notas jornalísticas em `title` podem não estar disponíveis no toque; há h5 sob h3 em referências e rótulo de seção Sobre atualmente em span. Labels, fieldsets, skip-link, dialog nativo, foco CSS e reduced-motion já existem e devem ser preservados. Não declarar não conformidade apenas pela leitura isolada, nem conformidade por existir atributo ARIA.

Comparação com a publicação: DOM renderizado obtido com Chrome headless em `baseline-2026-11-06/publicacao-dom.html`. A publicação contém o cabeçalho/logo e projeto, mas o DOM consultado não contém a definição “O que é feminicídio?”, os cinco tópicos educativos expansíveis, o link de Libras e a cartilha TJRS presentes no código local. Comparação limitada aos elementos buscados; não é comparação completa de dados ou estados e não estabelece data do deploy. A publicação não foi usada para substituir a versão local.

Inspeção visual inicial com Chrome headless: `baseline-2026-11-06/capturas/desktop-pagina-inteira.png` (1440 × 900) e `celular-pagina-inteira.png` (390 × 844) cobrem a extensão da página; existem também capturas com município/referências/diretório, diálogo anual, educação e metodologia abertos. O desktop mostra abertura relativamente espaçosa, CTA distante e texto Sobre com linha muito longa; o celular empilha conteúdo e mapa, com navegação e notas pequenas. Não se verificaram todas as combinações nem leitor de tela. `observacoes.json` registra textos/estados capturados e erros. O script usa CDP nativo, sem bibliotecas instaladas e sem acessar perfil pessoal.

## Inventário de preservação

Convenção: APP = App.tsx/App.css; MAP = MapExplorer.tsx/MapExplorer.css; NEWS = LatestCaseNews.tsx; ANUAL = AnnualDataDialog.tsx e estilos em App.css. A localização por símbolo/texto é preferida a linhas que mudarão. Cada linha deve receber evidência posterior (captura + ação/resultado + comparação de texto/dado/link, conforme aplicável). **P = pendente de conferência após implementação**, não preservação já comprovada. Todos os itens abaixo têm P nesta revisão.

Destinos A/B são propostas, condicionadas à escolha. A = Caderno editorial; B = Observatório territorial. Nenhum destino autoriza excluir ou duplicar conteúdo acidentalmente.

| ID | Conteúdo/função e responsável/local atual | Interações/estados e dados/fontes | Destino previsto A / B | Evidência posterior |
| --- | --- | --- | --- | --- |
| MARCA-01 | Logo horizontal no cabeçalho APP `.wordmark`; assets horizontal/compacto e ícone público | Link #inicio; alt vazio compensado por nome acessível do link; proporção e bytes dos assets | Cabeçalho com respiro em ambos; sem transformação gráfica | P: hash igual, captura e nome acessível |
| NAV-01 | APP skip-link, três âncoras da nav e frase do cabeçalho | #mapa, #entenda, #sobre; teclado e foco; #inicio pelo logo | A: índice horizontal de capítulos; B: navegação de consulta. Preservar âncoras, acrescentar atalhos a notícias/apoio/metodologia só com títulos existentes | P: destinos, teclado, estreito |
| INTRO-01 | APP #inicio, h1, afirmação de 2025, fonte e CTA | Texto integral; 4,6 dias e 80 ocorrências; link SSP específico; CTA #mapa | A: abertura tipográfica curta; B: introdução compacta de consulta | P: texto/link/CTA e captura |
| SOBRE-01 | APP #sobre, descrição acadêmica, privacidade e definição de feminicídio | Parágrafos integrais e link Código Penal art.121-A | A: contexto antes do mapa; B: contexto completo após notícias, com atalho direto | P: texto e acesso #sobre |
| MAP-01 | MAP `.map-explorer-heading`: título e instruções | Orientação para seleção e natureza agregada | Área de dados ampla em ambos | P: texto/semântica |
| MAP-02 | MAP `.map-controls`: Ano | 2026 inicial; 2020–2026; trocar limpa mês/município/serviço e erro anual; sete JSONs SSP | Barra visível em ambos | P: transições em todos anos |
| MAP-03 | MAP filtro Mês | Todos disponíveis; somente coverage.availableMonths; desabilitado sem dados; preserva seleção ao mudar | Junto ao ano em ambos | P: completo/parcial e meses |
| MAP-04 | MAP seleção municipal nativa | 497 opções ordenadas; alternativa ao clique; limpa serviço; incremento selectionVersion; IBGE/crosswalk | Mesmo grupo de filtros em ambos | P: seleção por teclado e mapa |
| MAP-05 | MAP `.network-controls` e fieldset | Dois checkboxes inicialmente ativos; quatro combinações; remover categoria selecionada limpa só serviço; contadores globais por categoria | A: faixa de camada; B: controles utilitários agrupados | P: quatro combinações e seleção |
| MAP-06 | MAP erro/carregamento de rede | Retry independente; erro da rede não impede números/mapa | Mensagem junto à camada | P: falha e recuperação |
| MAP-07 | MAP `.map-summary` | Registros RS, municípios positivos de 497, período; live; total publicado/meses disponíveis, null explícito | A: linha editorial de indicadores; B: faixa de resultados alinhada aos filtros | P: valores e recortes |
| MAP-08 | MAP erro/carregamento principal | Malha/crosswalk/arquivo anual, alert/status e retry; não exibir dados do ano anterior enquanto carrega | Área reservada do explorador | P: falhas, recarga e troca de ano |
| MAP-09 | MAP MapContainer/GeoJSON | Coroplético, click, tooltip, hover/seleção, pan/zoom, wheel condicionado ao botão; sem tiles externos | Mapa principal em ambos | P: interação e mesma classe numérica |
| MAP-10 | MAP ServiceMarkers/AccessibleServiceMarker/MapFocus/ServiceFocus | Círculo CRM/losango polícia; click/Enter/Espaço; seleção associa município; foco e reduced-motion; só ponto confirmado | Sobre mapa, com lista equivalente abaixo/ao lado | P: teclado/foco/sem coordenadas |
| MAP-11 | MAP MapLegend e network-legend | Mensal 0/1/2/3+; agregado 0/1–2/3–5/6+; indisponível separado; forma + cor nos serviços | Legenda sempre próxima, nunca tooltip apenas | P: rótulos/limiares/texto |
| MAP-12 | MAP `.municipality-panel` inicial e toolbar | Sem seleção: instrução; limpar serviço revela município, segundo limpar remove município; live | A: coluna de leitura ao lado; B: painel de consulta alinhado | P: limpar em duas etapas |
| MAP-13 | MAP detalhe municipal | Nome, positivo/zero/indisponível, contagem, período e código IBGE; month preserva município | Painel, sem hover obrigatório | P: três estados e período |
| MAP-14 | MAP `.case-news` details municipal, somente 2026, com município e sem serviço selecionado | Serviço tem prioridade no painel e oculta temporariamente detalhe municipal/referências; limpar serviço restaura município. Details fecha ao mudar chave ano/mês/seleção; loading/error/retry/null/zero/positivo sem link/com link; filtro editorial separado de SSP | Mantém acesso atual no painel, sem novas abas | P: matriz de estados, expansão e retorno após limpar serviço |
| MAP-15 | MAP itens das referências municipais | Veículo, título, URL, publicação confirmada ou alternativa, notas/evidência de data; ordem dateForOrdering | Lista editorial no painel; tornar nota essencial visível se necessário, sem reescrevê-la | P: texto/data/link e touch |
| MAP-16 | MAP detalhe de serviço | Nome/tipo, município, endereço/telefone/e-mails/horário condicionais, conferência, Maps condicional; enrichment por campo e fonte/data/nota separadas | Painel, mesma ordem lógica e fontes | P: campos condicionais/enrichment |
| MAP-17 | MAP `.network-directory` de serviços | Lista RS ou município; filtros afetam lista; botões de seleção; vazio explícito; serviços sem coordenadas/endereço continuam listados | Diretório adjacente ao painel, preservando details atual inicialmente | P: 84 serviços acessíveis nos recortes, inclusive dois sem ponto |
| MAP-18 | MAP `.map-source-note`/rodapé | Fonte SSP, atualização anual/fallback e link IBGE 2025 | Rodapé imediato dos dados, em ambos | P: fonte/data acompanha ano |
| NEWS-01 | NEWS seção e cabeçalho | Título completo, data de conferência/fallback e aviso publicação ≠ ocorrência | A: lista editorial de cinco itens; B: boletim em lista compacta, todos itens disponíveis | P: cinco referências corretas e aviso |
| NEWS-02 | NEWS cards/ol | Cinco mais recentes com publishedAt válido, nome IBGE pelo crosswalk, veículo, título, data e link/aria-label | Sem truncar títulos ou carrossel; mesma seleção/ordem | P: texto/URL/ordem |
| NEWS-03 | NEWS estados de carregamento/falha/vazio | Retry; status; nenhuma referência com data confirmada | Próximo ao título, preservando mensagens | P: cada estado |
| EDU-01 | APP #entenda, título e introdução | Texto integral sobre formas de violência | A: abertura de capítulo; B: seção de orientação por títulos | P: texto/captura |
| EDU-02 | APP `.violence-grid`: seis formas | Física, psicológica, sexual, patrimonial, moral, vicária; descrições integrais | A: verbetes com separadores; B: lista de definição estruturada. Coluna única no estreito | P: seis textos completos |
| EDU-03 | APP nota legal após formas | Lei 15.384/2026, link PDF e nota de meios digitais | Junto das formas, sem legenda minúscula | P: texto/link |
| EDU-04 | APP details Sinais de controle e perseguição | Dois parágrafos completos; abrir/fechar por teclado/toque | Mesmo capítulo e expansão nativa existente | P: conteúdo aberto e teclado |
| EDU-05 | APP details Medidas protetivas | Cinco parágrafos, 190, fontes Ministério/STF; ressalvas e ênfase | Mesmo capítulo; não abreviar | P: textos/fontes/tel |
| EDU-06 | APP details Violência sexual | Atendimento SUS, BO, vestígios e fontes; todo o texto | Mesmo capítulo e acesso atual | P: texto/fontes |
| EDU-07 | APP details Qual serviço procurar? | Cinco dt/dd, parágrafos e link 180; direitos e recorte do mapa | Mesmo capítulo; definições com largura de leitura | P: cinco serviços e notas |
| EDU-08 | APP details Violência vicária e vicaricídio | Distinção, manutenção recorte SSP e fonte legal | Mesmo capítulo e acesso atual | P: texto/link |
| EDU-09 | APP `.support-guidance` e `.education-help` | Como oferecer apoio, confidencialidade, risco imediato, 190, #apoio | A: texto + faixa de ajuda; B: orientação + bloco de serviço distinto | P: texto/tel/âncora |
| EDU-10 | APP `.education-sources` | Duas fontes Ministério e cartilha TJRS/CEVID 2026 | Fecho de orientação, links completos | P: três URLs e rótulos |
| APOIO-01 | APP #apoio e três artigos | Brigada/190, Central/180, Escuta Lilás/08005410803; descrições, fontes oficiais e Libras | A: faixa de utilidade com telefones; B: seção de canais por finalidade. Nunca depender de mapa | P: todos textos/links/tel/Libras |
| MET-01 | APP #metodologia, facts e Como interpretar | Recorte, Jan–Set/2026, atualização, 497/IBGE2025, zero/null, revisões, atualização manual, limites territoriais e privacidade | A: capítulo final de método; B: seção de consulta final. Atalho direto em ambos | P: todos textos e números |
| MET-02 | APP `.methodology-history` | Expansão existente; tabela 2026–2020, coberturas/datas, sete gatilhos anuais | Mesmo histórico, sem esconder metodologia restante | P: sete linhas/datas/ações |
| ANUAL-01 | ANUAL gatilho e dialog por ano | Abertura modal nativa, loading/error, fechamento X/Escape e retorno de foco ao gatilho; fetch e validação. Não há botão retry interno: fechar/reabrir tenta carregar novamente quando não há dados | Diálogos atuais com novo estilo, sem mudar mecanismo | P: sete anos, foco e recuperação de falha ao reabrir |
| ANUAL-02 | ANUAL busca/paginação | Busca sem acentos/caixa; reinicia página; sem resultado; anterior/próxima desabilitados nos limites; retenção de estado por instância | Controles visíveis junto ao resultado | P: busca/limites/reabertura |
| ANUAL-03 | ANUAL tabela desktop/lista mobile | 497 municípios por ano; 12 meses e total; null = Indisponível; 25 itens/página desktop, 10 até 700px; resize reinicia página; contador live | Preservar duas representações e todos campos; rolagem interna da tabela quando necessária | P: células e equivalência desktop/mobile |
| MET-03 | APP `.methodology-network` | 84 serviços, 82 pontos confirmados, dois em lista; limites da Patrulha/delegacias, IEDE, licença/atribuição | Mesmo capítulo final; notas também vinculadas ao mapa | P: texto/números/fonte/licença |
| MET-04 | APP `.methodology-sources` | SSP indicadores e malhas IBGE | Fontes completas junto ao método | P: links |
| CRED-01 | APP footer | Disciplina/Faculdade/UFRGS, duas autoras, RS/Brasil, desenvolvedor e GitHub | Rodapé legível em ambos, sem ocultar créditos | P: textos/URL |
| META-01 | index.html/main.tsx | lang pt-BR, título, descrição, viewport, favicon/theme-color, Analytics existente | Preservar infraestrutura; theme-color só acompanhará token aprovado | P: metadados/ícone e sem integração nova |

### Evidências posteriores por identificador

Abreviações: **S** = código JSX/dados sem alterações segundo hashes e revisão independente; **V** = capturas comparáveis da página (`baseline-2026-11-06/capturas/` e `entrega-2026-11-06/capturas-completas/`); **I** = interações registradas em `capturas-completas/observacoes.json`; **M** = `matriz-dados-2026-11-07.json` e `comparacao-matriz.json`; **F** = `testes-falhas.json`; **A** = `testes-acessibilidade.json`; **Z** = `zoom-real.json`. As evidências são parciais: S confirma identidade do arquivo, não prova visibilidade de todos os estados; V mostra somente estados capturados; I/M/F/A/Z cobrem os casos descritos nos respectivos relatórios. Pendências individuais continuam na coluna P do inventário.

| ID | Evidência posterior e limite |
| --- | --- |
| MARCA-01 | S, V; hash do logo horizontal preservado |
| NAV-01 | S, V, A; Tabs iniciais e nomes de navegação amostrados |
| INTRO-01 | S, V; texto e fonte visíveis |
| SOBRE-01 | S, V; texto e link visíveis |
| MAP-01 | S, V; título e instrução visíveis |
| MAP-02 | S, I, M, A; sete anos e troca por teclado |
| MAP-03 | S, I, M; 88 recortes disponíveis, totais confrontados com JSONs |
| MAP-04 | S, I, M; seleções amostradas e nome acessível no Chrome |
| MAP-05 | S, I, M; quatro combinações e diretório amostrados |
| MAP-06 | S, F; falha simulada e retry da rede |
| MAP-07 | S, I, M; 88 resumos confrontados com JSONs |
| MAP-08 | S, V; erro principal ainda não simulado |
| MAP-09 | S, V; mapa visualizado, seleção por clique em polígono não exaustiva |
| MAP-10 | S, A; foco no primeiro marcador, ativação e demais marcadores não exaustivos |
| MAP-11 | S, V; legenda capturada; cores e contraste não exaustivos |
| MAP-12 | S, I; limpar serviço e voltar ao município |
| MAP-13 | S, I, M; Aceguá zero, Alecrim positivo e Porto Alegre |
| MAP-14 | S, I, M; referências selecionadas/abertas, erros específicos pendentes |
| MAP-15 | S, I, M; referências amostradas, datas alternativas não exaustivas |
| MAP-16 | S, I, M; serviços amostrados inclusive campos enriquecidos |
| MAP-17 | S, I, M; lista com quatro combinações e dois serviços sem ponto |
| MAP-18 | S, V; fonte e atualização visíveis nas capturas |
| NEWS-01 | S, V; título e nota de data visíveis |
| NEWS-02 | S, V; cinco itens, dados e URLs preservados no código |
| NEWS-03 | S, F; erro/retry testados; estado vazio pendente |
| EDU-01 | S, V; introdução visível |
| EDU-02 | S, V; seis verbetes visíveis |
| EDU-03 | S, V; nota legal e link visíveis |
| EDU-04 | S, I, A; conteúdo aberto e Enter amostrados |
| EDU-05 | S, I; conteúdo expandido amostrado |
| EDU-06 | S, I; conteúdo expandido amostrado |
| EDU-07 | S, I; conteúdo expandido amostrado |
| EDU-08 | S, I; conteúdo expandido amostrado |
| EDU-09 | S, V; orientação e bloco de ajuda visíveis |
| EDU-10 | S, V; três fontes visíveis, sem abertura de URLs externas |
| APOIO-01 | S, V; três contatos e Libras visíveis |
| MET-01 | S, V; interpretação e limites visíveis |
| MET-02 | S, I; histórico aberto e gatilhos anuais acionados |
| ANUAL-01 | S, I, F, A; sete anos, falha 2020, Escape e retorno de foco |
| ANUAL-02 | S, I, M; busca, vazio e avanço amostrados |
| ANUAL-03 | S, I, M; 2026 desktop/celular, zero e indisponível amostrados |
| MET-03 | S, V; recorte de serviços e licença visíveis |
| MET-04 | S, V; fontes SSP/IBGE visíveis |
| CRED-01 | S, V; créditos visíveis |
| META-01 | S; HTML/integração preservados por hash |

Dados conferidos por leitura dos JSONs: todos os sete anos têm 497 municípios. Totais estaduais publicados 2020=80, 2021=96, 2022=111, 2023=86, 2024=73, 2025=80, 2026=56. O último é Jan–Set, não total de ano completo. 2026 tem outubro–dezembro null. Índice editorial: 38 referências, 35 com publicação confirmada, conferido em 2026-11-03; últimas notícias usam só datas confirmadas, referências municipais podem usar datas alternativas explicitadas. Esses valores são baseline, não novos indicadores para acrescentar à interface.

Dados/arquivos envolvidos: sete `src/data/ssp-rs/generated/feminicidio-consumado-AAAA.json`, `case-news-2026.json`, `src/data/ibge/rs-municipios-2025.geojson`, crosswalk e aliases, `src/data/rede-protecao/services.json` e `contact-enrichments.json`. Scripts de importação são inventariados, mas não executados nem necessários para redesign. Não inferir localização individual, área territorial de cobertura de serviço ou ligação 1:1 entre notícia e ocorrência.

## Pesquisa aplicada e natureza das evidências

Fontes primárias consultadas. Nenhuma métrica de sucesso de redesign foi adotada; nenhuma direção é chamada de comprovadamente melhor. A aplicação ao projeto é decisão de design, a validar no piloto.

| Referência, autoria/data/link | Natureza e problema | Princípio e adaptação concreta | Limites |
| --- | --- | --- | --- |
| GOV.UK Design System team, sem data editorial indicada: [Layout](https://design-system.service.gov.uk/styles/layout/) e [Type scale](https://design-system.service.gov.uk/styles/type-scale/) | Prática documentada; largura de leitura e hierarquia inconsistentes | Separar coluna de leitura e largura dos dados; escala relativa própria | Serviços transacionais diferem deste projeto; não copiar fonte, grid ou identidade |
| GOV.UK team, [Table](https://design-system.service.gov.uk/components/table/), sem data editorial indicada | Prática; comparação de números | Caption/cabeçalhos, alinhamento numérico e estrutura semântica nas tabelas existentes | Não resolve sozinha tabela com 12 meses no celular; preservar lista mobile |
| Marwa Boukarim, Christian Swinehart e Sophia Mersmann, 18/10/2023, [Redesigning our interactive data visualizations](https://ourworldindata.org/redesigning-our-interactive-data-visualizations) | Relato da equipe; controles, leitura e fontes | Filtros junto ao resultado, recorte explícito e procedência próxima do explorador | Não importar abas/downloads/tela cheia nem funcionalidades novas; sem benefício quantitativo transferível |
| Amanda Sakuma com Jan Diehm, fev/2026 segundo índice, [Sizing chaos — The Pudding](https://pudding.cool/2026/02/womens-sizing/) | Referência de composição e narrativa; alternância entre explicação e exploração | Diferenciar forma dos módulos conforme função; lista de notícias e capítulo educativo não imitam painel estatístico | Não copiar abertura de scroll, personagens, letras decorativas ou animações; tema e objetivos diferentes |
| W3C, WCAG 2.2, 05/10/2023; tradução autorizada Ceweb.br 27/03/2025, [português](https://www.w3.org/Translations/WCAG22-pt-BR/) | Norma; alvo A/AA | Critérios aplicáveis orientam verificações, descritas adiante | Não declarar conformidade integral por lint, screenshot ou inspeção automática |
| Edward Segel e Jeffrey Heer, 2010, [Narrative Visualization: Telling Stories with Data](https://vis.stanford.edu/files/2010-Narrative-InfoVis.pdf), especialmente seção 4.4 | Pesquisa de estratégias narrativas; orientação editorial versus exploração | Introdução curta seguida de exploração livre; atalhos permitem acesso direto sem percurso obrigatório | Taxonomia e casos não provam ganho de usabilidade aqui; não adotar slideshow obrigatório |
| Catherine D’Ignazio e Lauren Klein, 16/03/2020, [The Numbers Don’t Speak for Themselves](https://data-feminism.mitpress.mit.edu/pub/czq9dfs5/release/3) | Fundamentação crítica; contexto e procedência | Fontes e limites junto aos dados; preservar separação entre notícias e registros SSP e entre zero/ausência | Não prescreve uma paleta ou layout específico nem autoriza novos relatos ou inferências |

Hipóteses do projeto: proximidade de filtro/resultado pode facilitar entender o recorte; larguras diferentes para texto/dados podem favorecer leitura; variedade funcional pode reduzir monotonia. Validar com conteúdo real, inspeção e avaliação do usuário; não apresentar como resultado acadêmico.

## Duas direções para escolha

### A — Caderno editorial de dados (recomendação provisória)

Conceito: uma publicação de consulta e leitura, cuja identidade surge do enquadramento da marca, dos filetes e da relação entre títulos, texto e dados. Usar cantos de enquadramento apenas como referência discreta aos cantos do símbolo, sem redesenhá-lo. Abertura curta, sem altura mínima de tela nem imagem nova. O título textual existente permanece; serifada em títulos editoriais contrasta com a marca intacta e a interface sans.

Página inteira: cabeçalho/logo e índice → abertura com afirmação/fonte/CTA → contexto/definição completos → exploração territorial → cinco notícias em lista editorial → educação com seis verbetes e cinco expansões existentes → orientação e canais de apoio → metodologia completa/histórico/diálogos → créditos. Índice permite ir diretamente a dados ou ajuda. Mantém sequência de conteúdo atual, melhorando composição, sem criar etapa narrativa obrigatória.

Tipografia: Georgia/Cambria/serif nos títulos editoriais e destaque; Arial/Helvetica/sans-serif no texto, filtros, números e tabela. Paleta proposta: papel #F7F4EE, superfície #FFFDF8, tinta #28241F, secundário #5F5952, ação vinho #8B2638, borda estrutural #C9C0B5 e foco #244F70 com separação clara. São escolhas propostas, ainda sem contraste medido em todos contextos; o logo não recebe esses tokens.

Composição: contêiner de até 88rem para dados, leitura de 62–70ch; títulos de seção em margem lateral no largo, incorporados à coluna no estreito. Filetes separam capítulos; notícias usam linhas com data/município/veículo/título/ação, sem aspect-ratio forçado. Educação usa verbetes de alturas naturais, não cards idênticos. Apoio usa bloco funcional com contatos legíveis.

Densidade/celular: filtros acima do mapa; resumo compacto; painel de seleção contíguo ao mapa no largo, abaixo no estreito; fonte e legenda próximas. Tabelas mantêm representação mobile completa. Nenhum texto truncado. Espaçamento de capítulo diminui no estreito sem reduzir leitura a microtexto. Expansões existentes permanecem; não acrescentar novas.

Referências: disciplina de leitura/tipo do GOV.UK; alternância de função do exemplo The Pudding; equilíbrio orientação/exploração de Segel/Heer; contexto e procedência de Data Feminism. Vantagens esperadas: personalidade editorial e equilíbrio entre dados, educação e apoio. Riscos: serifada pode competir com marca se excessiva; notas laterais podem ficar distantes; precisam retornar ao fluxo no celular. Confirmar em tela antes do piloto.

### B — Observatório territorial

Conceito: ambiente de consulta orientado à seleção, com rigor gráfico, hierarquia utilitária e identificação territorial. A marca fica em cabeçalho claro; painéis de dados têm estrutura mais delimitada. Personalidade por régua de recorte, alinhamento numérico e relação entre mapa e painel, sem aparência de painel corporativo genérico.

Página inteira: logo/navegação → abertura muito compacta com afirmação/fonte/CTA → exploração territorial em posição prioritária → notícias como boletim de consulta → contexto/definição completos → educação e cinco tópicos → apoio → metodologia/histórico/diálogos → créditos. Mover Sobre para depois das notícias muda sua posição, mas conserva #sobre e atalho no cabeçalho. Todas as seções continuam no fluxo contínuo, sem novas abas.

Tipografia: Arial/Helvetica/sans-serif em toda interface, títulos de peso 700 e escala mais contida; números tabulares para comparação. Paleta proposta: base #F4F5F3, superfície #FFFFFF, tinta #222825, secundário #53605B, acento vinho #8B2638 relacionado à marca, estrutura verde-ardósia #33564E e foco #244F70. Verde-ardósia é estrutura, não uma nova classe estatística; mapas mantêm rampa independente. Logo intocado, sem inversão para fundo escuro.

Composição: contêiner até 92rem; filtros e resumo em faixas horizontais no largo; mapa e painel como área de consulta delimitada; listas/tabelas priorizam escaneamento. Navegação mais utilitária, sem sidebar fixa obrigatória. Educação usa títulos/definições e espaçamento de leitura, apoio tem zona própria. Não tratar cada bloco como card com sombra.

Densidade/celular: filtros empilham por largura real; resumo conserva rótulos e valores; mapa antecede detalhe; diretório textual e fontes continuam acessíveis; notícias viram linhas de altura natural; todo texto educativo permanece. Sem esconder controles em menu para manter painel limpo. Fonte, período e seleção acompanham o resultado.

Referências: organização dos controles/fontes documentada no OWID, tabelas e escala do GOV.UK; Data Feminism fundamenta limites junto à consulta. Vantagens esperadas: rapidez de consulta e forte consistência dos dados. Riscos: dar menor peso à dimensão educativa/humana; página visualmente técnica demais; deslocar Sobre aumenta importância do atalho e da contextualização já existente junto ao mapa.

### Esquemas de composição (não são telas implementadas)

```text
A — Caderno editorial                    B — Observatório territorial
┌ Logo intacto | índice ───────────┐     ┌ Logo intacto | navegação ────────┐
│ Título + afirmação/fonte + CTA   │     │ Título + afirmação/fonte + CTA  │
│ Contexto + definição completos  │     ├ Ano | mês | município | camadas ┤
├ Capítulo de dados ──────────────┤     │ Resumo do recorte              │
│ Filtros + resumo                │     │ Mapa amplo | painel de seleção │
│ Mapa amplo | leitura da seleção │     │ Legenda + diretório + fontes   │
│ Legendas, diretório e fontes    │     ├ Boletim de notícias ───────────┤
├ Notícias: cinco entradas ───────┤     │ Sobre + definição completos    │
│ Educação: verbetes + tópicos    │     ├ Educação + tópicos ────────────┤
│ Orientação + canais de apoio    │     │ Orientação + canais de apoio   │
│ Método + histórico + diálogos   │     │ Método + histórico + diálogos  │
└ Créditos ───────────────────────┘     └ Créditos ──────────────────────┘
Estreito: uma coluna na ordem do DOM; mapa, detalhes, legendas e fontes contíguos.
```

Escolha registrada: A, Caderno editorial de dados, pelo usuário em 6 de novembro de 2026. A escolha é de composição e identidade, não de alteração de funcionalidades. Falta inspeção visual inicial para confirmar medidas e hierarquias.

## Design system: proposta e aplicação parcial no piloto

Definir valores finais após escolha e inspeção inicial. Reutilizar e consolidar tokens de `src/index.css`, evitando um segundo sistema paralelo. `App.css` e `MapExplorer.css` devem consumir os mesmos papéis. Cores do mapa atualmente em objeto TS devem permanecer semanticamente sincronizadas com legenda; migrar para tokens compatíveis com Leaflet somente com verificação de cor renderizada.

| Família | Especificação proposta e critério |
| --- | --- |
| Cores semânticas | text/default, text/secondary, bg/page, bg/surface, bg/subtle, border/decorative, border/control, action/default-hover-active, focus/ring, state/error-loading-empty-selected. Não usar borda decorativa de baixo contraste como única indicação de controle |
| Cartografia | Classes atuais preservadas; rampa vinho sequencial para positivos, zero claro distinto, indisponibilidade com rótulo textual e tratamento próprio; seleção por contorno. CRM/polícia mantêm cores distintas e círculo/losango. Não acrescentar gráficos novos |
| Tipo | Corpo 1rem a 1.125rem, entrelinha 1.6–1.7; interface 1rem/1.4; notas 0.875rem/1.5; h1 fluido aproximadamente 2.25–4rem, h2 1.75–2.5rem, h3 1.125–1.5rem. Ajustar pelo conteúdo sem nowrap forçado. Fontes locais de sistema, sem download |
| Espaço | Escala rem: .25, .5, .75, 1, 1.5, 2, 3, 4; respiro por função. Margens laterais fluidas; leitura 62–70ch; grid de dados maior conforme direção |
| Responsividade | Pontos de quebra orientados por filtros/conteúdo; começar validando 320, 390, 768, 1024 e 1440px. Preservar contrato anual 700px/10 itens e demais estados até decisão explícita sobre mudança. Não esconder módulos |
| Bordas/raios/sombras | Filetes editoriais; raios pequenos nos controles, não grandes cápsulas em tudo. Sem sombra decorativa de cards; sombra só se necessária a sobreposição/modal/marker existente |
| Componentes | SectionHeading, SourceNote, StatusMessage, Field/FilterGroup, DataSummary, SelectionPanel, EditorialList, ContactBlock, AnnualTable/Dialog. Extrair componente só se houver repetição real; estados continuam na lógica atual |
| Interações | Hover/focus/active/disabled/selected distintos; labels permanentes; erro e vazio textuais; seleção compreensível sem cor; manter aria-live, retorno de foco e ações de retry independentes |
| Movimento | Sem animação de entrada/contadores/scroll obrigatório. Manter reduced-motion global e nos movimentos do Leaflet; qualquer transição curta apenas com função |

Verificação numérica preliminar das paletas propostas, calculada pela luminância relativa sRGB: A tinta/papel 14,04:1, secundário/papel 6,30:1, ação/papel 7,87:1, branco/ação 8,63:1; B tinta/base 13,73:1, secundário/base 6,02:1, estrutura/branco 8,13:1; foco proposto/papel A 7,88:1. São pares isolados sem transparência. Não verificam estados, bordas, cores cartográficas, tamanho real, contraste de todos os fundos nem conformidade da interface. A borda decorativa proposta não serve automaticamente como borda de controle; definir token próprio com contraste adequado no piloto.

## Etapas, dependências e aceite

| Etapa | Estado | Arquivos previstos/alterados | Evidência e condição de saída |
| --- | --- | --- | --- |
| 0. Revalidação e baseline | Concluído para início do piloto, com lacunas explicitadas | docs/redesign e baseline | Manifesto/cópias, capturas desktop/celular, amostras de estados e DOM público; sem cobertura exaustiva das interações |
| 1. Pesquisa e duas direções | Concluída: usuário escolheu A | Este plano; nenhuma UI | Fontes primárias, problemas/aplicações/limites; escolha explícita registrada |
| 2. Tokens e piloto | Implementado; verificações proporcionais realizadas | src/index.css, src/App.css e src/components/map/MapExplorer.css. Nenhum JSX/dado alterado pelo piloto | Cabeçalho, abertura, Sobre e mapa estilizados; capturas/estados comparados e revisão independente; veja registro abaixo |
| 3. Avaliação do piloto | Concluída: usuário respondeu “OK. Continue.” | Sem correções adicionais solicitadas | Continuidade autorizada pelo usuário |
| 4. Conteúdo editorial e apoio | Implementado e inspecionado; estados de falha pendentes | src/App.css, src/components/news/LatestCaseNews.tsx e LatestCaseNews.css | Capturas desktop/celular; cinco itens e conteúdo educativo mantidos; revisão independente de código e hashes |
| 5. Método, fontes e tabelas | Implementado; conferência parcial | src/App.css | Sete anos abriram com 497 municípios; busca, resultado vazio, paginação e diálogo estreito amostrados; detalhes abaixo |
| 6. Conferência integral | Parcial, não concluída | Ajustes e documentação | Revisão independente, hashes, lint/build, capturas, amostras de falha e desempenho; restam cenários de acessibilidade e combinações listados abaixo |

Em cada bloco: revalidar status/hash local → delimitar IDs → editar mínimo → comparar conteúdo/estado baseline → inspecionar desktop/celular → corrigir → atualizar este plano e cópia de Downloads. Não aplicar CSS amplo que transforme toda página silenciosamente no piloto: manter tokens de layout novos limitados ao escopo piloto até avaliação; verificar impacto dos tokens globais no restante.

## Matriz de verificação planejada

- Conteúdo: comparar strings/URLs/metadados e números com arquivos originais e manifesto; confirmar presença na interface, inclusive expandida e após seleção/paginação. Mudança de arquivo de conteúdo exige justificativa por trecho. Hash igual dos dados e assets é necessário, mas insuficiente para presença na UI.
- Mapa: sete anos; meses publicados; ano completo e Jan–Set/2026; positivo/zero; indisponibilidade pela tabela/estado se não selecionável no mapa; quatro combinações de camadas; município com/sem serviços; marcador e seleção nativa; enrichment; serviço sem coordenada/endereço; limpar em dois passos; referências confirmadas/alternativas/ausentes; selecionar município → abrir referências → escolher serviço → limpar serviço → referências novamente acessíveis; falhas/retries independentes. Não criar opção de mês ausente apenas para teste.
- Anuais: abrir cada ano; buscar com/sem acento, vazio e sem resultado; primeira/última páginas; paginação desktop 25/mobile 10; mudança de largura; fechamento por X/Escape e foco de retorno; falha de carregamento → fechar → reabrir → nova tentativa; null/zero/positivo/total; fontes. Conferir todos os municípios via dados e amostras significativas de tela, sem alegar clique manual em 3.479 registros.
- Layout: 320/390/768/1024/1440px, zoom 200%/400%; sem cortes/sobreposição/rolagem horizontal da página. Mapa/tabela podem precisar de navegação bidimensional própria; não esconder campos para evitá-la. Conteúdo essencial acessível sem hover.
- Acessibilidade A/AA: 1.1.1 alternativas; 1.3.1/1.3.2 estrutura/ordem; 1.4.1 cor; 1.4.3 contraste texto 4,5:1 ou 3:1 ampliado, 1.4.4 zoom, 1.4.10 reflow, 1.4.11 contraste controles, 1.4.12 espaçamento, 1.4.13 hover/foco; 2.1.1/2.1.2 teclado, 2.4.1/2.4.3/2.4.6/2.4.7/2.4.11 navegação/foco, 2.5.3 rótulo, 2.5.7 arrastar, 2.5.8 alvos (24 CSS px ou exceções aplicáveis); 3.3.2 instruções e 4.1.2/4.1.3 nomes/estados. Meta de projeto: controles principais de 44px. Avaliação de leitor de tela, se disponível; registrar limitações. Não declarar conformidade total.
- Técnica: lint e build depois de alterações de código; sem instalação. Registrar erros preexistentes separadamente de regressões. Capturar console durante fluxos; não presumir limpo por build passar.
- Desempenho: antes/depois no mesmo navegador, viewport, cache e condição; registrar tempo de carregamento/inicialização do mapa, requisições, tamanho de assets e fluidez básica. Sem novas fontes remotas/assets grandes. Sem baseline medido, não declarar ausência de regressão.
- Capturas: mesma viewport e seleção, topo, extensão completa, mapa sem/com seleção, serviços, referência municipal, educação expandida, apoio, método aberto e diálogo anual; nomes antes/depois e IDs documentados. Capturas da linha de base, piloto e entrega em `docs/redesign/`.

## Revisão e continuidade

Delegação real disponível. Um subagente pesquisou referências; outro auditou mapa/dados em leitura, sem escrever. O segundo também fez revisão profunda independente deste plano contra o código, sem implementar: nenhum achado crítico/alto; um médio (condição de acesso às referências quando serviço ocupa painel) e dois baixos (recuperação do diálogo por reabertura e seletor de fonte). Os três foram incorporados ao inventário e à matriz. Parecer: proposta condicionada adequada; não aprova implementação. As entregas não substituem teste visual. Revisões após piloto e no final ainda pendentes, até dois subagentes simultâneos e sem escritores concorrentes. Modelo/esforço herdados; não inferir níveis ou modelos específicos pelo nome do papel.

Auditoria de escopo: VALIDADO COM LACUNAS. DoR do piloto: atendida com direção A escolhida e baseline visual. Usuário autorizou expansão ao responder “OK. Continue.”; testes descritos com seus limites.

Pendências materiais: comparação exaustiva publicação/local, combinações completas do inventário, contraste não textual e estados não amostrados, leitor de tela e avaliação integral dos marcadores após carregamento. Design system aplicado à página inteira, mas não declarar aceite integral nem conformidade WCAG sem as verificações pendentes. Nenhuma necessidade editorial foi aplicada. O possível problema de nota de data só em title é candidato de apresentação acessível, sem mudar sua redação.

### Conferência integrada após expansão

- Arquivos de implementação: `src/index.css`, `src/App.css`, `src/components/map/MapExplorer.css`, `src/components/news/LatestCaseNews.tsx` (somente importação) e `src/components/news/LatestCaseNews.css` (novo). A revisão independente comparou os 36 arquivos do manifesto: 32 hashes intactos e quatro mudanças previstas; `App.tsx`, dados, logos, package/lock e HTML preservados. Isso não comprova sozinho visibilidade em todas as combinações.
- NEWS-01–03: cinco referências visíveis em lista nas capturas, título/data/veículo/link preservados no mesmo JSX; erro e retry simulados com sucesso; estado vazio não simulado. EDU-01–10 e APOIO-01: seis verbetes e três canais visualizados; os cinco tópicos foram expandidos e retornaram conteúdo na inspeção automatizada. Falta avaliação humana de leitor de tela e todos os links em interação.
- MET-01–04, ANUAL-01–03 e CRED-01: textos e fontes mantidos no `App.tsx` idêntico ao baseline; sete diálogos de 2020 a 2026 abriram com 497 municípios e 25 entradas iniciais no desktop. Busca por Porto Alegre retornou um resultado; busca inexistente retornou mensagem vazia; botão Próxima abriu página 2 de 20; 2026 exibiu “Indisponível”. Em 320px, Escape fechou o diálogo e retornou foco ao gatilho. Não houve amostragem exaustiva de células, última página, todas as buscas ou erros de carregamento.
- MAP-01–18: seleção de Porto Alegre e notícias, seleção de serviço e retorno ao município e quatro combinações de controles exercitadas. Todos os 88 recortes anuais/mensais disponíveis de 2020–2026 foram acionados; o script `comparar-matriz.mjs` confrontou totais estaduais e números de municípios positivos exibidos com os JSONs locais, sem divergências, omissões ou recortes extras (`comparacao-matriz.json`). Aceguá mostrou zero e Alecrim mostrou um registro e referência; serviços em Passo Fundo sem coordenadas confirmadas e Sagrada Família sem endereço público foram selecionados pelo diretório. As quatro combinações listaram 84/30/54/0 serviços e mensagem vazia quando ambas desligadas. MAP-09/10 ainda não cobre cada marcador ou seleção por teclado. MARCA-01/NAV-01/INTRO-01/SOBRE-01 aparecem nas capturas e código original; teclado completo e avaliação individual dos alvos ainda pendem. META-01: HTML e integração originais preservados por hash.
- Chrome headless: capturas em `entrega-2026-11-06/capturas-completas/`, larguras 320, 390, 768, 1024 e 1440px. Zoom real de 100%, 200% e 400% testado em viewport físico 1280×900. Em 400%, foi encontrado deslocamento horizontal de 3,75px devido ao min-width de 320px em html/body; a regra foi removida e o reteste registrou clientWidth=scrollWidth=316px e deslocamento zero. 100% e 200% também tiveram deslocamento zero. Capturas do zoom são da abertura; não cobrem todos os diálogos ou conteúdos expandidos. Evidência `zoom-real.json` e `testes-zoom.mjs`. Não foram avaliados leitor de tela ou contraste de todos os componentes; não afirmar conformidade integral. Não houve erros de console nos percursos integrados. Um HTTP 500 ocorreu durante escrita concorrente no bloco editorial e não se repetiu; causa não determinada.
- Revisão independente de `revisao_final`: identificou risco no diálogo estreito; inspeção confirmou corte por `white-space` herdado. Corrigidos quebra do texto, layout dos controles e dimensionamento móvel; captura final registrou `scrollWidth=clientWidth=302` no diálogo a 320px e Escape/foco corretos. Grade de duas colunas em telas até 430px confirma leitura de “Indisponível” sem quebra da palavra na captura final `entrega-2026-11-06/capturas-finais/estreito-dialogo-anual.png`.
- Falhas simuladas por interceptação seletiva em requisições locais: indisponibilidade de serviços exibiu aviso e preservou o mapa; retry restaurou filtros; erro no anual 2020 mostrou alerta e fechar/reabrir recuperou 497 municípios; erro em notícias mostrou aviso e retry recuperou cinco itens. Evidência `entrega-2026-11-06/testes-falhas.json` e script `testes-falhas.mjs`. Um teste anterior de bloqueio amplo foi inconclusivo por atingir módulo Vite; não representava falha do produto.
- Em `matriz-dados-2026-11-07.json`, a tabela anual 2026 avançou de 1–25 para 26–50 no desktop e de 1–10 para 11–20 no celular; busca Porto Alegre retornou um município e busca inexistente, zero. Zero e meses indisponíveis continuam distintos. A comparação dos 88 resumos foi feita com os JSONs incorporados, não com as planilhas oficiais originais. A matriz amostrou municípios e notícias, sem cobrir todos os cruzamentos.
- Teclado: `testes-acessibilidade.json` registra 15 Tabs iniciais, seta alterando ano, Espaço no filtro, Enter abrindo tópico, Enter abrindo diálogo e Escape retornando ao gatilho. O marcador possui foco visível no elemento filho, apesar de o elemento pai não possuir outline; a inspeção do filho registrou outline sólido de 3px. Reflow por viewport em 320/640px é aproximação de largura, não teste de zoom real. Onze amostras de cores CSS opacas tiveram contraste calculado entre 6,3:1 e 15,16:1; não cobre todas as cores/estados. O inventário automático apontou 23 elementos com uma dimensão menor que 24px; alguns são links em linha ou controles com rótulo associado, mas espaçamento e exceções do critério 2.5.8 ainda exigem análise individual.
- A árvore de acessibilidade do Chrome registra navegação principal, nomes de Ano/Mês/município e filtros; é uma amostra técnica e não substitui leitor de tela. Os controles de zoom Leaflet têm nomes acessíveis em inglês (“Zoom in” e “Zoom out”), comportamento preexistente; registrar para avaliação, sem alterar conteúdo silenciosamente. Narrador do Windows existe nesta máquina; sua utilização com a interface não foi verificada.
- Triagem de alvos: os checkboxes medem 18×18px, mas têm labels clicáveis de aproximadamente 274×40 e 276×40px; marcadores mantêm sua posição geográfica e alguns se sobrepõem. A [explicação oficial do W3C sobre 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) prevê exceções de alvo equivalente e para posição essencial em mapas, mas sua aplicação concreta e a equivalência integral do diretório precisam de avaliação; a contagem automática de proximidade inclui elementos fora da área recortada e não comprova não conformidade.
- Conferência adicional: percurso por Tab chegou ao link GitHub do rodapé após 15 focos iniciais e mais 115 passos, com indicador CSS no alvo ou no filho do marcador, sem erro de console; não cobre todas as combinações de conteúdos abertos nem substitui leitor de tela. O relatório `testes-acessibilidade.json` registra a sequência e a árvore AX.
- Auditoria independente de contraste de texto (`contraste-detalhado-antes-correcao.json`) encontrou o texto secundário do diretório em 4,454:1 sobre a superfície, abaixo de 4,5:1 para texto normal. Ajuste localizado em `MapExplorer.css` usa `--editorial-muted` nos textos secundários e na mensagem vazia; reteste em desktop/celular mediu 5,906:1 para texto secundário. A mensagem vazia não foi exercitada diretamente no reteste. Um candidato residual no relatório corresponde a `#map-instructions.visually-hidden`, que não é texto visual; o método não cobre imagens, opacidade de grupo e todos os estados/cores não textuais. Evidência: `contraste-detalhado.json`, `testes-contraste.mjs` e revisão independente.
- Auditoria independente de alvos (`auditoria-alvos-independente.json`) encontrou o telefone 0800 com altura de 23,906px em 375px, próximo ao link de fonte. `App.css` ampliou `.support-phone` para área mínima de 44px; reteste registrou 138,81×44px em 375 e 1280px, sem sobreposição com a fonte. Nos estados inicial, expandido e diálogo amostrados, não foram detectados outros conflitos de espaçamento fora de links em parágrafos. A quantidade de marcadores carregados variou entre medições, portanto o resultado não demonstra cobertura integral do mapa.
- Após os ajustes de contraste/alvo: lint e build passaram; `capturas-acessibilidade/observacoes.json` registra cabeçalhos e estados iniciais coincidentes com baseline, documento sem overflow horizontal em 320/390/768/1024/1440px e nenhum erro de console. A captura e a comparação são amostras; a análise não garante conformidade WCAG completa.
- Lint e build passaram, com saída de build em pasta temporária; `dist/` existente preservado. Comparação de desempenho: `comparar-desempenho.mjs` reconstruiu baseline isolado e confirmou os 36 hashes do manifesto, compilou antes/depois e mediu quinze carregamentos alternados em Chrome headless 1440×900, servidor local e cache desativado. Mediana até resumo do mapa disponível: 880ms antes e 887ms depois; faixas 669–2014ms e 599–1402ms. CSS 50.046→64.468 bytes sem compressão; JS 436.968 bytes nas duas versões. Não se observou regressão material nessa amostra local; a variação, ausência de controle de CPU/rede e a diferença de aparelhos limitam a conclusão. Evidência `desempenho.json`; resultado de cinco rodadas anterior preservado em `desempenho-cinco-rodadas.json`.

### Evidência do piloto A

- Arquivos: `src/index.css` adiciona tokens editoriais; `src/App.css` aplica ao cabeçalho, abertura e Sobre; `src/components/map/MapExplorer.css` aplica ao explorador. O diff de `App.tsx` é anterior ao piloto. As alterações anteriores em App.css foram preservadas.
- A e B: capturas originais em `baseline-2026-11-06/capturas/`; piloto em `piloto-2026-11-06/capturas-final/`. Foram inspecionadas visualmente as páginas em 1440, 390, 320 e 768 CSS px; documento sem overflow horizontal medido nesses quatro tamanhos. Chrome headless não substitui dispositivo físico nem testes de zoom.
- Comparação via `observacoes.json`: títulos desktop/celular, resumo e os estados capturados antes/depois são idênticos: seleção Porto Alegre, referências jornalísticas, diretório, diálogo 2026 e primeiro tópico educativo. Quatro combinações das duas camadas foram acionadas; seleção de serviço e limpeza foram exercitadas; trocar para 2025 exibiu total 80 e limpou seleções. Os totais e rótulos reportados vieram da própria interface. Os testes não cobrem todas as combinações ou casos de erro.
- Hash SHA-256 do logo horizontal segue `036C264C89A6AAD153CA4BDA31A8F2A2A24795F424BF3167E555A4C27D407DB3`. Os arquivos de dados e JSX não foram modificados pelo piloto; hash não comprova sozinho visibilidade de todos os estados.
- `npm run lint`: passou. `npm run build -- --outDir <pasta temporária nova>`: passou (76 módulos). Primeira tentativa restrita falhou com `spawn EPERM`; repetida com permissão de execução. `dist/` existente não foi sobrescrito. Chrome não capturou erros de console nos percursos executados.
- Revisão independente estática de `revisao_piloto` encontrou conflitos no tamanho da abertura/logo e no breakpoint dos separadores. Corrigidos e reavaliados pelo mesmo revisor, sem regressão material adicional nos estilos examinados. Capturas posteriores incluem 320 e 768px. Um espaçamento previsto no piloto é substituído por valor legado em telas pequenas; não foi considerado regressão funcional.
- Preservação por ID: MARCA-01, NAV-01, INTRO-01, SOBRE-01 e MAP-01 a MAP-05/MAP-07/MAP-09/MAP-11 a MAP-18 têm evidência parcial de código, captura ou interação; MAP-06/MAP-08 e cenários especiais permanecem pendentes. Os demais IDs foram vistos na captura inicial ou em amostras, mas sua conferência integral fica para os respectivos blocos. Não marcar 45 itens como concluídos.

## Histórico breve

### Complemento de verificação — 2026-11-07

- A pedido do usuário, removido o limite de 25 caracteres do título de notícias para que ocupe a largura disponível; a quebra natural permanece em telas estreitas. Arquivo: `src/components/news/LatestCaseNews.css`. Chrome headless: título em uma linha na captura desktop `titulo-noticias-largo.png`; teste `teste-icones-servico.json` passou e registrou ausência de overflow do documento em 320/390/1440px.

- A pedido expresso do usuário, removida da interface a frase sobre área de atendimento das bases da Patrulha e pontos compartilhados. Os filtros e a lista de serviços permanecem; as limitações seguem documentadas no histórico técnico deste plano.

- A pedido do usuário, o nome do serviço selecionado exibe o mesmo símbolo usado no mapa/legenda, antes do título; a escolha da forma é compartilhada com o marcador, incluindo a margarida específica. Ícone decorativo oculto da árvore acessível, nome e categoria mantidos em texto. Arquivos: `MapExplorer.tsx` e `MapExplorer.css`. `teste-icones-servico.json` verificou os oito símbolos por tipo e os dois serviços sem ponto, com 320/390/1440 sem overflow do documento, amostras de filtro/seleção e nenhuma exceção JS capturada. Captura móvel inspecionada: `detalhe-icone-selecionado-320.png`. Lint e build passaram; leitor de tela não foi testado.

- A pedido do usuário, os sete filtros de serviços foram agrupados em `details/summary`, inicialmente recolhidos; o resumo mostra a contagem de filtros ativos mesmo quando fechado, e as seleções permanecem ao fechar/reabrir. A legenda foi reordenada por ícones semelhantes: casas e margarida; distintivos; martelos. Arquivos: `src/components/map/MapExplorer.tsx` e `MapExplorer.css`. Revisão independente estática não encontrou regressão; Chrome headless (`teste-filtros-painel.json`) confirmou abertura por Enter, retenção de seleção e resumo 6/7, 128 combinações de filtros/contagens, seleções amostradas, atalho e foco no juizado. Larguras 320/390/1440 sem overflow de documento; capturas `filtros-fechados-*`, `filtros-abertos-320.png`, e detalhe desktop `detalhe-filtros-fechados.png` inspecionado. Lint e build passaram; leitura por leitor de tela não foi testada.

- Inclusão autorizada de promotorias e PML: consulta IEDE de 07/11/2026 arquivada em `iede-promotorias-pml-2026-11-07.geojson`; adicionadas 12 promotorias especializadas e 34 postos médico-legais. Revisão independente confirmou 322 registros anteriores intactos, 368 totais e IDs únicos. Snapshot anterior em `rede-antes-promotorias-pml-2026-11-07.json`; integração reproduzível em `adicionar-promotorias-pml-2026-11-07.mjs`. Agora há 366 marcadores e 368 serviços na lista, com pontos coincidentes preservados separadamente; os endereços e geometrias são da IEDE e não foram todos conferidos individualmente. O recorte de promotorias não representa todas as unidades do MPRS.
- `MapExplorer.tsx` acrescenta filtros separados, marcadores martelo verde para promotorias e distintivo azul para PML, legenda e orientação nos detalhes do PML: encaminhamento por autoridade policial e confirmação de horários por telefone, conforme [IGP-RS](https://igp.rs.gov.br/onde-tem-posto-medico-legal). CSS/tokens, importador, dados, README e textos sobre a rede foram atualizados. Revisão independente apontou descrição educativa desatualizada, corrigida. Chrome headless `teste-promotorias-pml.json`: 128 combinações corretas para marcadores e lista, seleções amostradas incluindo novas categorias e orientação do PML, foco e atalho, 320/390/1440 sem overflow de documento e sem exceções JS capturadas. Captura desktop inspecionada `detalhe-promotorias-pml.png`. Lint e build passaram; leitor de tela, conferência individual de endereços e comparação de desempenho continuam pendentes.

- Juizados: token `--service-justica` alterado para vermelho `#DF0918`, indicado para o logotipo brasão em reprodução do [Guia de Identidade Visual e Verbal do TJRS](https://pt.scribd.com/document/890976180/Guia-de-Ident-Visual-e-Verbal-v2-HQ); a referência consultada é cópia de terceiro, não fonte oficial direta. Marcador e legenda usam o mesmo token. Chrome headless registrou sucesso em `teste-rede-ampliada.json`, incluindo filtros, amostras de seleção, foco e larguras 320/390/1440. Não foi feita auditoria integral de contraste ou teste com leitor de tela.

- A pedido do usuário, CRM passou a usar `home` amarelo e Sala Lilás `home` lilás; Sala das Margaridas continua com margarida amarela. Legenda especifica Sala Lilás. Vetor `home` obtido dos [ícones Material do Google](https://github.com/google/material-design-icons/blob/master/src/action/home/materialicons/24px.svg), sem dependência ou fonte remota. Captura desktop inspecionada em `detalhe-mapa-home.png`; `teste-rede-ampliada.json` registrou sucesso nas 32 combinações, seleções amostradas e larguras 320/390/1440. Lint e build passaram; contraste não textual e leitor de tela não foram avaliados integralmente.

- Alteração solicitada dos símbolos: `gavel` em dourado queimado para juizados e `local_police` preto para unidades policiais especializadas e roxo para Patrulha; legendas acompanham. Vetores locais extraídos dos [ícones oficiais Material do Google — gavel](https://github.com/google/material-design-icons/blob/master/src/action/gavel/materialicons/24px.svg) e [local_police](https://github.com/google/material-design-icons/blob/master/src/maps/local_police/materialicons/24px.svg), sem instalar dependência ou carregar fonte remota. Distintivos compartilham forma e diferem por cor; nome acessível e lista textual preservam identificação sem depender só de cor. Captura inspecionada `detalhe-mapa-icones.png`; `teste-rede-ampliada.json` passou 32 combinações, seleções amostradas, foco de juizado e larguras 320/390/1440, sem exceções JS registradas. Lint e build passaram. Não foi feita auditoria integral de contraste não textual ou avaliação de leitor de tela.

- Ajuste de marcadores solicitado: paleta de serviços mais saturada com tokens em `src/index.css`; `MapExplorer.tsx` diferencia Sala das Margaridas pelo tipo oficial e acrescenta sua entrada na legenda; `MapExplorer.css` desenha margarida amarela com contorno escuro, preservando foco e seleção externos. Salas Lilás seguem no marcador de acolhimento, sem alteração de dados ou filtros. Chrome headless repetiu 32 combinações e seleções amostradas, 320 marcadores/322 entradas, atalho e foco do juizado; 320/390/1440 sem overflow do documento e sem exceções JS registradas (`teste-rede-ampliada.json`). Captura desktop inspecionada em `detalhe-mapa-cores.png`; lint e build passaram. Não houve análise exaustiva de contraste não textual ou teste com leitor de tela.

- Ampliação da rede solicitada pelo usuário: consulta IEDE de 2026-11-07 arquivada em `iede-consulta-2026-11-07.geojson`; incorporados 96 registros Sala das Margaridas, 9 Sala Lilás, 119 bases da Patrulha e 14 juizados. Os 84 registros anteriores foram preservados campo a campo (revisão independente); 322 serviços na lista, 320 marcadores após enriquecimentos. Arquivos: `src/data/rede-protecao/services.json`, README, `scripts/import-protection-network.mjs`, `MapExplorer.tsx`, `MapExplorer.css` e texto em `App.tsx`. Snapshot anterior preservado em `rede-antes-ampliacao-2026-11-07.json`; geração registrada em `ampliar-rede-2026-11-07.mjs`. Os novos pontos são geocodificações da IEDE, não confirmações independentes de endereço.
- Cinco filtros com nome da categoria e legenda por formas/cores; pontos sobrepostos preservados individualmente na lista, inclusive sete pares exatos encontrados na revisão; bases não indicam área de cobertura. Atalho de teclado para a lista antes dos marcadores. Revisão independente identificou formas semelhantes e possível recorte do foco; corrigidos triângulo e contorno externo. Teste Chrome headless `teste-rede-ampliada.json`: 32 combinações com contagens da lista corretas, seleções amostradas de cada um dos quatro novos tipos, 320 pontos/322 entradas, foco do atalho no summary e contorno de foco de 3px no juizado; larguras 320/390/1440 sem overflow horizontal de documento e nenhum erro JS registrado. Capturas `rede-ampliada-{320,390,1440}.png`. Testes não conferem posição geográfica individual nem anunciações por leitor de tela; não foi realizada nova comparação de desempenho. Lint e build executados, build em diretório temporário. Categorias adicionais (PML, procuradorias, promotorias, cartórios, ouvidorias) permanecem fora desta primeira etapa, conforme a recomendação aprovada.

- Ajustes solicitados posteriormente: `src/App.css` remove a largura máxima da nota legal diretamente abaixo da lista de tipos de violência; `src/components/news/LatestCaseNews.css` posiciona a nota de data abaixo do cabeçalho, alinhada à esquerda e sem limite artificial de largura. `src/App.tsx` simplifica a descrição da camada de serviços a pedido do usuário: mantém 84 serviços, 82 pontos e acesso aos outros dois pela lista, omitindo os detalhes anteriores sobre endereços, cobertura e classificação. Link e atribuição da fonte permanecem. Mudança editorial autorizada explicitamente pelo usuário.
- Verificação: lint e build passaram (build em pasta temporária); `ajustes-texto-2026-11-07/` reúne capturas em 320/390/768/1024/1440px e `observacoes.json`, com percursos amostrados sem erros de console. A captura desktop de página inteira foi inspecionada. Leitor de tela continua pendente conforme indicado abaixo.

- MAP-08: falha simulada da requisição da malha municipal exibiu alerta e botão de nova tentativa; após restabelecer a requisição, o mapa voltou e o alerta desapareceu. MAP-14: falha das referências jornalísticas, com Porto Alegre selecionada e seção aberta, exibiu aviso; a nova tentativa recuperou quatro referências. As simulações também repetiram os testes de serviços, dados anuais e notícias recentes com sucesso. Evidência: `entrega-2026-11-06/testes-falhas-complementar.json` e `testes-falhas.mjs`; falhas simuladas não medem condições reais de rede.
- Leitor de tela: revisão independente confirmou a existência do Narrador e do Chrome, mas não executou avaliação auditiva; o navegador headless e a árvore AX não permitem validar leitura, anúncios dinâmicos ou experiência com foco do Narrador. Ativá-lo na sessão interativa poderia interferir no ambiente do usuário. Próximo passo para essa lacuna: avaliação humana com Narrador em navegador visível, incluindo diálogo, alterações dos filtros e mensagens de estado.
- MAP-09/10: revisão independente em Chrome headless comparou os 82 marcadores renderizados aos registros locais com coordenadas: rótulos e categorias coincidem, e os 82 serviços aparecem também no diretório de 84 entradas. Com filtros, CRM apresenta 53 marcadores/54 entradas; polícia especializada, 29/30; ambos desligados, 0/0. Enter em dois marcadores e Espaço em um terceiro selecionaram o painel e o item do diretório, com foco visível; foco programático. Evidência: `marcadores-cobertura.mjs` e `entrega-2026-11-06/marcadores-cobertura.json`. A comparação não valida coordenadas geográficas projetadas nem ativou individualmente os 82 marcadores. A requisição externa do Vercel Analytics foi deliberadamente bloqueada na inspeção.
- Nesta etapa foram alterados apenas os scripts e registros de verificação; a interface e os dados não foram modificados. Permanecem pendentes avaliação humana com leitor de tela e verificações adicionais de acessibilidade, conforme limitações acima. Próximo passo exato: executar com Narrador e Chrome visível os percursos de filtros, diálogo, mapa e anúncios de estado e registrar os resultados; depois reavaliar eventuais achados.

- 2026-11-06: pedido aceito com duas decisões sequenciais do usuário: direção visual e avaliação do piloto. Auditoria identifica mudanças locais a preservar.
- 2026-11-06: tentativa inicial de controle do Chrome interrompida pela ferramenta por não conseguir determinar URL com segurança. Nenhum contorno foi realizado.
- 2026-11-06, retomada: host de acesso ao navegador continua indisponível; inventário por código e referências prosseguem. localhost:5173 responde 200. Publicação continua sem comparação confiável.
- 2026-11-06: baseline de 36 arquivos, duas cópias exatas e diff persistidos; lint passou. A e B documentadas, A recomendada provisoriamente. Interface permanece intacta.
- 2026-11-06: plano criado em Downloads, existência e identidade com cópia local verificadas; revisão independente refinou três itens do inventário. Rechecagem dos 36 arquivos do manifesto encontrou zero mudanças. Pares preliminares de contraste calculados, sem declaração de conformidade.
- 2026-11-06: usuário escolheu direção A. Revalidados HEAD, estado dos dois arquivos já modificados e igualdade inicial das cópias do plano; servidor local respondeu HTTP 200. Nova tentativa de inventariar navegadores retornou host de acesso indisponível; inspeção visual e capturas seguem pendentes. Nenhum código de interface alterado.
- 2026-11-06: a pedido do usuário, tentativa direta de abrir http://localhost:5173/ no navegador integrado retornou “The browser access host is unavailable”. HTTP 200 foi confirmado novamente; conexão HTTP não demonstra renderização visual. Inspeção visual e piloto seguem pendentes.
- 2026-11-06: usuário autorizou explicitamente Chrome headless. Perfil isolado e CDP permitiram inspecionar local e publicação; baseline visual e estados amostrados registrados. Piloto A implementado em três CSS; revisão independente encontrou conflitos responsivos corrigidos; lint/build e comparações descritas acima. Aguardando avaliação do usuário antes de expandir.
- 2026-11-06: usuário respondeu “OK. Continue.”. Notícias migradas para lista editorial em CSS próprio; educação e apoio receberam tipografia e espaçamento editoriais sem alteração do conteúdo. Capturas iniciais do bloco em `bloco-editorial-2026-11-06/capturas/`; um erro HTTP 500 foi observado durante edição concorrente, causa ainda não confirmada, exigindo nova verificação integrada. Metodologia/tabelas e revisão final pendentes.
- 2026-11-06: metodologia, tabela/dialog, fontes e rodapé receberam os tokens editoriais. Capturas finais registradas, sem overflow de página nos quatro tamanhos; diálogo móvel corrigido e verificado. Lint/build passaram; revisão independente e hashes confirmam preservação dos arquivos de conteúdo e dados. Conferência funcional e de acessibilidade permanece parcial conforme matriz.
- 2026-11-07: concluídos testes complementares de falha/recuperação de serviços, dados anuais e notícias, e amostra de teclado/contraste/reflow. Quinta largura de 1024px capturada sem overflow do documento; combinações de filtros conferidas no diretório de Porto Alegre. Permanecem pendentes os testes discriminados na conferência integrada.
- 2026-11-07: comparação de desempenho com builds isolados verificados; zoom real 100/200/400% encontrou overflow de 3,75px em 400%, corrigido removendo min-width de html/body, com reteste sem deslocamento e revisão estática independente. Triagem de alvos identificou rótulos clicáveis para checkboxes e marcadores próximos/sobrepostos; não inferir conformidade ou falha sem avaliar equivalência e exceções.
- 2026-11-07: matriz de dados exercitou 88 recortes, filtros, zero/positivo, serviços sem ponto e paginação em desktop/celular. Comparação automatizada dos 88 resumos com JSONs locais passou sem divergências. Lint final passou sem avisos; leitor de tela, alvos e cenários restantes continuam explicitamente pendentes.
- 2026-11-07: árvore AX do Chrome inspecionada para nomes de navegação e filtros; zoom Leaflet em inglês registrado como questão anterior. W3C consultado sobre as exceções de tamanho de alvo; não foi atribuída conformidade automática ao mapa.
- 2026-11-07: auditorias independentes encontraram contraste de 4,454:1 no diretório e alvo telefônico de 23,906px no celular. Correções localizadas elevaram contraste a 5,906:1 e alvo telefônico a 44px; retestes, lint/build, percurso por teclado e capturas registrados. Leitor de tela e cobertura integral de marcadores permanecem pendentes.
- 2026-11-07: desempenho repetido após ajustes finais; mediana posterior maior na amostra (854ms antes, 971ms depois), com faixas sobrepostas e alta variabilidade. Resultado inconclusivo sobre regressão material; não tratar a medição anterior como referente ao CSS final.
- 2026-11-07: medição ampliada para quinze rodadas alternadas no CSS final; medianas 880ms antes e 887ms depois, sem regressão material observada nessa amostra local. Limitações e amostra anterior preservadas.
