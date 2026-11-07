# Plano de redesign — Feminicídio em Foco

Atualizado em 6 de novembro de 2026 (America/Sao_Paulo). Documento de continuidade e de decisão; não é declaração de entrega concluída.

## Estado e próximo passo

- Etapa atual: auditoria por código e pesquisa realizadas; propostas visuais preparadas para escolha. Auditoria visual permanece pendente.
- Interface: nenhuma alteração feita pelo redesign. Direção visual ainda não aprovada; design system abaixo é proposta.
- Próximo passo exato: apresentar A e B ao usuário; registrar sua escolha. Antes de editar a interface, completar a inspeção da versão atual em desktop/celular e seus estados quando o acesso ao navegador funcionar, registrar capturas e confirmar ou corrigir o diagnóstico. A escolha não dispensa essa inspeção inicial.
- Servidor existente: `http://localhost:5173/`, resposta HTTP 200 confirmada. Não foi iniciado outro servidor.
- Arquivo solicitado: `C:\Users\wesle\Downloads\plano-redesign-feminicidio-em-foco.md`. Esta cópia no projeto é o documento preparado; a gravação em Downloads será tentada e verificada separadamente. Se houver cópias, mantê-las sincronizadas ao fim de cada etapa, com a mesma revisão.

## Objetivo, escopo e limites

Criar uma linguagem visual própria, séria, humana e editorial, melhorando hierarquia, composição, tipografia, espaçamento, navegação, dados e responsividade. Implementação incremental no código atual, somente depois da escolha do usuário e da inspeção inicial pendente.

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
- Capturas da interface: ainda não disponíveis. Manifesto de arquivos não substitui evidência visual nem comportamental.

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
| Browser/desktop/celular/console/performance | Não verificados; host de acesso ao navegador indisponível no CUA |

## Diagnóstico inicial: fatos e hipóteses

Fatos do código: identidade atual usa papel quente, texto escuro, acento vinho, Arial/Helvetica e vários tokens já existentes. Contêiner chega a 1760px; abertura tem altura mínima até 480px e CTA com posicionamento absoluto em desktop; notícia usa grade de cinco colunas e proporção de cartão; textos de leitura usam token de 0.9rem. Há diferentes breakpoints para mapa, notícias, educação e tabela anual. O mapa contém cores hardcoded além dos tokens globais. Não há gráfico temporal neste fluxo: há resumo numérico, coroplético, detalhes e tabelas anuais.

Hipóteses a verificar na tela: abertura pode afastar dados sem acrescentar contexto proporcional; repetição de grades pode nivelar conteúdos de funções diferentes; leitura extensa pode beneficiar-se de largura menor e corpo maior; CTA absoluto pode aproximar-se do texto em larguras intermediárias. Não são defeitos visualmente comprovados nem resultados de pesquisa de usuários.

Pontos a investigar em acessibilidade: marcadores de 18/22px exigem avaliação de alvo/espaçamento/exceções; polígonos canvas precisam de alternativa textual equivalente; notas jornalísticas em `title` podem não estar disponíveis no toque; há h5 sob h3 em referências e rótulo de seção Sobre atualmente em span. Labels, fieldsets, skip-link, dialog nativo, foco CSS e reduced-motion já existem e devem ser preservados. Não declarar não conformidade apenas pela leitura isolada, nem conformidade por existir atributo ARIA.

Comparação com a publicação: NÃO CONCLUÍDA. O endereço público falhou na ferramenta web; solicitação HTTP independente também falhou na conexão. Não foi possível determinar se a publicação corresponde ao HEAD, ao dist ou ao working tree. Diferenças locais versus HEAD são confirmadas; diferenças local versus publicação permanecem desconhecidas. Não usar a publicação ou dist para substituir a versão local.

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
| MAP-14 | MAP `.case-news` details municipal, somente 2026 | Fecha ao mudar chave ano/mês/seleção; loading/error/retry/null/zero/positivo sem link/com link; filtro editorial separado de SSP | Mantém acesso atual no painel, sem novas abas | P: matriz de estados e expansão |
| MAP-15 | MAP itens das referências municipais | Veículo, título, URL, publicação confirmada ou alternativa, notas/evidência de data; ordem dateForOrdering | Lista editorial no painel; tornar nota essencial visível se necessário, sem reescrevê-la | P: texto/data/link e touch |
| MAP-16 | MAP detalhe de serviço | Nome/tipo, município, endereço/telefone/e-mails/horário condicionais, conferência, Maps condicional; enrichment por campo e fonte/data/nota separadas | Painel, mesma ordem lógica e fontes | P: campos condicionais/enrichment |
| MAP-17 | MAP `.network-directory` de serviços | Lista RS ou município; filtros afetam lista; botões de seleção; vazio explícito; serviços sem coordenadas/endereço continuam listados | Diretório adjacente ao painel, preservando details atual inicialmente | P: 84 serviços acessíveis nos recortes, inclusive dois sem ponto |
| MAP-18 | MAP `.map-source`/rodapé | Fonte SSP, atualização anual/fallback e link IBGE 2025 | Rodapé imediato dos dados, em ambos | P: fonte/data acompanha ano |
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
| ANUAL-01 | ANUAL gatilho e dialog por ano | Abertura modal nativa, loading/error, fechamento X/Escape e retorno de foco ao gatilho; fetch e validação | Diálogos atuais com novo estilo, sem mudar mecanismo | P: sete anos e foco |
| ANUAL-02 | ANUAL busca/paginação | Busca sem acentos/caixa; reinicia página; sem resultado; anterior/próxima desabilitados nos limites; retenção de estado por instância | Controles visíveis junto ao resultado | P: busca/limites/reabertura |
| ANUAL-03 | ANUAL tabela desktop/lista mobile | 497 municípios por ano; 12 meses e total; null = Indisponível; 25 itens/página desktop, 10 até 700px; resize reinicia página; contador live | Preservar duas representações e todos campos; rolagem interna da tabela quando necessária | P: células e equivalência desktop/mobile |
| MET-03 | APP `.methodology-network` | 84 serviços, 82 pontos confirmados, dois em lista; limites da Patrulha/delegacias, IEDE, licença/atribuição | Mesmo capítulo final; notas também vinculadas ao mapa | P: texto/números/fonte/licença |
| MET-04 | APP `.methodology-sources` | SSP indicadores e malhas IBGE | Fontes completas junto ao método | P: links |
| CRED-01 | APP footer | Disciplina/Faculdade/UFRGS, duas autoras, RS/Brasil, desenvolvedor e GitHub | Rodapé legível em ambos, sem ocultar créditos | P: textos/URL |
| META-01 | index.html/main.tsx | lang pt-BR, título, descrição, viewport, favicon/theme-color, Analytics existente | Preservar infraestrutura; theme-color só acompanhará token aprovado | P: metadados/ícone e sem integração nova |

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

Recomendação: A, provisoriamente, pelo peso conjunto de dados, educação, apoio e autoria acadêmica no conteúdo encontrado. A escolha é de composição e identidade, não de funcionalidades. Falta inspeção visual inicial para confirmar medidas e hierarquias. Nenhuma direção aprovada nesta revisão.

## Design system proposto, ainda não implementado

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

## Etapas, dependências e aceite

| Etapa | Estado | Arquivos previstos/alterados | Evidência e condição de saída |
| --- | --- | --- | --- |
| 0. Revalidação e baseline | Código e hashes concluídos; visual/publicação pendentes | Criados apenas docs/redesign e baseline, sem src/public modificados | Manifesto/cópias verificadas, status Git; completar capturas/estados antes de editar UI |
| 1. Pesquisa e duas direções | Pesquisa registrada; aguardando escolha | Este plano; nenhuma UI | Fontes primárias, problemas/aplicações/limites; escolha explícita registrada |
| 2. Tokens e piloto | Não iniciada | index.css, App.tsx/App.css e MapExplorer.css; MapExplorer.tsx apenas para integração necessária | Cabeçalho/abertura + explorador territorial representativo, com dados/legenda/seleção/diretório, desktop/mobile; demais seções intactas e acessíveis |
| 3. Avaliação do piloto | Não iniciada | Correções locais do piloto | Usuário avalia prévia local; revisão independente verifica inventário/estados; só expandir após essa avaliação |
| 4. Conteúdo editorial e apoio | Não iniciada | App.tsx/App.css, LatestCaseNews se necessário | NEWS/EDU/APOIO completos; nenhum texto/link truncado ou reescrito; inspeção largo/estreito |
| 5. Método, fontes e tabelas | Não iniciada | App.tsx/App.css, AnnualDataDialog se necessário | MET/ANUAL/CRED/META completos; equivalência tabela/lista, busca e sete anos |
| 6. Conferência integral | Não iniciada | Ajustes mínimos e documentação | Cada ID tem evidência; lint/build aplicáveis, teclado, foco, zoom, reflow, console e comparação de desempenho; revisão independente |

Em cada bloco: revalidar status/hash local → delimitar IDs → editar mínimo → comparar conteúdo/estado baseline → inspecionar desktop/celular → corrigir → atualizar este plano e cópia de Downloads. Não aplicar CSS amplo que transforme toda página silenciosamente no piloto: manter tokens de layout novos limitados ao escopo piloto até avaliação; verificar impacto dos tokens globais no restante.

## Matriz de verificação planejada

- Conteúdo: comparar strings/URLs/metadados e números com arquivos originais e manifesto; confirmar presença na interface, inclusive expandida e após seleção/paginação. Mudança de arquivo de conteúdo exige justificativa por trecho. Hash igual dos dados e assets é necessário, mas insuficiente para presença na UI.
- Mapa: sete anos; meses publicados; ano completo e Jan–Set/2026; positivo/zero; indisponibilidade pela tabela/estado se não selecionável no mapa; quatro combinações de camadas; município com/sem serviços; marcador e seleção nativa; enrichment; serviço sem coordenada/endereço; limpar em dois passos; referências confirmadas/alternativas/ausentes; falhas/retries independentes. Não criar opção de mês ausente apenas para teste.
- Anuais: abrir cada ano; buscar com/sem acento, vazio e sem resultado; primeira/última páginas; paginação desktop 25/mobile 10; mudança de largura; fechamento por X/Escape e foco de retorno; null/zero/positivo/total; fontes. Conferir todos os municípios via dados e amostras significativas de tela, sem alegar clique manual em 3.479 registros.
- Layout: 320/390/768/1024/1440px, zoom 200%/400%; sem cortes/sobreposição/rolagem horizontal da página. Mapa/tabela podem precisar de navegação bidimensional própria; não esconder campos para evitá-la. Conteúdo essencial acessível sem hover.
- Acessibilidade A/AA: 1.1.1 alternativas; 1.3.1/1.3.2 estrutura/ordem; 1.4.1 cor; 1.4.3 contraste texto 4,5:1 ou 3:1 ampliado, 1.4.4 zoom, 1.4.10 reflow, 1.4.11 contraste controles, 1.4.12 espaçamento, 1.4.13 hover/foco; 2.1.1/2.1.2 teclado, 2.4.1/2.4.3/2.4.6/2.4.7/2.4.11 navegação/foco, 2.5.3 rótulo, 2.5.7 arrastar, 2.5.8 alvos (24 CSS px ou exceções aplicáveis); 3.3.2 instruções e 4.1.2/4.1.3 nomes/estados. Meta de projeto: controles principais de 44px. Avaliação de leitor de tela, se disponível; registrar limitações. Não declarar conformidade total.
- Técnica: lint e build depois de alterações de código; sem instalação. Registrar erros preexistentes separadamente de regressões. Capturar console durante fluxos; não presumir limpo por build passar.
- Desempenho: antes/depois no mesmo navegador, viewport, cache e condição; registrar tempo de carregamento/inicialização do mapa, requisições, tamanho de assets e fluidez básica. Sem novas fontes remotas/assets grandes. Sem baseline medido, não declarar ausência de regressão.
- Capturas: mesma viewport e seleção, topo, extensão completa, mapa sem/com seleção, serviços, referência municipal, educação expandida, apoio, método aberto e diálogo anual; nomes antes/depois e IDs documentados. Hoje nenhuma captura da página foi obtida.

## Revisão e continuidade

Delegação real disponível. Um subagente pesquisou referências; outro auditou mapa/dados em leitura, sem escrever. As entregas ajudam o inventário e não substituem teste visual. Solicitar revisão profunda independente deste plano antes da implementação, e revisão após piloto e no final, até dois subagentes simultâneos e sem escritores concorrentes. Modelo/esforço herdados; não inferir níveis ou modelos específicos pelo nome do papel.

Auditoria de escopo: VALIDADO COM LACUNAS para planejamento. DoR de implementação: BLOQUEADA até escolha visual e inspeção inicial desktop/celular; nenhuma decisão adicional de conteúdo necessária agora. As partes independentes (pesquisa/inventário/documentação) podem avançar.

Pendências materiais: acesso visual local, capturas, comparação publicação/local, contraste efetivo, teclado/zoom/leitor de tela, console/performance; design system não implementado. Nenhuma necessidade editorial foi aplicada. O possível problema de nota de data só em title é candidato de apresentação acessível, sem mudar sua redação.

## Histórico breve

- 2026-11-06: pedido aceito com duas decisões sequenciais do usuário: direção visual e avaliação do piloto. Auditoria identifica mudanças locais a preservar.
- 2026-11-06: tentativa inicial de controle do Chrome interrompida pela ferramenta por não conseguir determinar URL com segurança. Nenhum contorno foi realizado.
- 2026-11-06, retomada: host de acesso ao navegador continua indisponível; inventário por código e referências prosseguem. localhost:5173 responde 200. Publicação continua sem comparação confiável.
- 2026-11-06: baseline de 36 arquivos, duas cópias exatas e diff persistidos; lint passou. A e B documentadas, A recomendada provisoriamente. Interface permanece intacta.
