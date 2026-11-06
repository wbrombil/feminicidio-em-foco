import './App.css'
import MapExplorer from './components/map/MapExplorer'
import LatestCaseNews from './components/news/LatestCaseNews'
import AnnualDataDialog from './components/annual-data/AnnualDataDialog'

function App() {
  return (
    <main className="landing-page">
      <a className="skip-link" href="#mapa">Pular para o mapa</a>
      <header className="site-header">
        <a className="wordmark" href="#inicio" aria-label="Feminicídio em Foco, início">
          <img src="/logo-feminicidio-em-foco-horizontal.svg" alt="" />
        </a>
        <nav className="primary-nav" aria-label="Navegação principal">
          <a href="#mapa">Mapa</a>
          <a href="#entenda">Entenda e busque apoio</a>
          <a href="#sobre">Sobre o projeto e os dados</a>
        </nav>
        <span className="header-note">Dados, justiça e rede de proteção</span>
      </header>

      <section className="intro" id="inicio" aria-labelledby="page-title">
        <div className="intro-copy">
          <h1 id="page-title">Feminicídio <em>em Foco</em></h1>
          <div className="intro-feature-row">
            <aside className="statement" aria-label="Sobre o conteúdo">
              <p>No Rio Grande do Sul, em 2025, uma mulher foi vítima de feminicídio consumado a cada aproximadamente 4,6 dias, em média.</p>
              <span className="statement-rule" aria-hidden="true" />
              <a className="source-link" href="https://ssp.rs.gov.br/governador-eduardo-leite-detalha-queda-dos-indicadores-criminais-em-2025-o-ano-mais-seguro-da-historia-do-rs" target="_blank" rel="noreferrer">
                Fonte: SSP-RS · 80 ocorrências <span aria-hidden="true">↗</span>
              </a>
            </aside>
            <div className="explore-action">
              <a className="explore-link" href="#mapa">Explorar o mapa</a>
            </div>
          </div>
        </div>
      </section>

      <section className="about" id="sobre" aria-labelledby="about-title">
        <div className="section-label"><span id="about-title">Sobre o projeto e os dados</span></div>
        <div className="about-content">
          <p>
            Este projeto acadêmico reúne <strong>informações sobre feminicídios consumados no Rio Grande do Sul desde 2020</strong>, com registros organizados por <strong>município e mês</strong>, além de <strong>conteúdos educativos e caminhos de apoio</strong>. Os dados e as fontes são contextualizados com cuidado, respeitando a privacidade das pessoas envolvidas.
          </p>
        </div>

      </section>

      <section className="map-preview" id="mapa" aria-labelledby="map-title">
        <div className="section-label"><span>Mapa de dados</span></div>
        <MapExplorer />
      </section>

      <LatestCaseNews />

      <section className="education" id="entenda" aria-labelledby="education-title">
        <div className="section-label"><span>Entenda e busque apoio</span></div>
        <div className="education-content">
          <div className="education-intro">
            <h2 id="education-title">A violência pode assumir diferentes formas.</h2>
            <p>A Lei Maria da Penha reconhece formas de violência que podem ocorrer juntas e não dependem de marcas físicas para serem levadas a sério.</p>
          </div>

          <ul className="violence-grid" aria-label="Formas de violência doméstica e familiar previstas na Lei Maria da Penha">
            <li className="violence-item">
              <h3>Física</h3>
              <p>Condutas que ofendem a integridade ou a saúde corporal. As marcas podem ser visíveis ou não.</p>
            </li>
            <li className="violence-item">
              <h3>Psicológica</h3>
              <p>Ameaças, humilhações, isolamento, vigilância e tentativas de controlar decisões ou comportamentos.</p>
            </li>
            <li className="violence-item">
              <h3>Sexual</h3>
              <p>Constranger a mulher a manter ou participar de relação sexual não desejada mediante intimidação, ameaça, coação ou força; ou limitar sua liberdade sexual e reprodutiva.</p>
            </li>
            <li className="violence-item">
              <h3>Patrimonial</h3>
              <p>Reter ou destruir documentos, bens e recursos; controlar o acesso ao próprio dinheiro.</p>
            </li>
            <li className="violence-item">
              <h3>Moral</h3>
              <p>Calúnia, difamação e injúria, incluindo ofensas à honra e exposição da vida íntima.</p>
            </li>
            <li className="violence-item">
              <h3>Vicária</h3>
              <p>Violência contra descendentes, ascendentes, dependentes, enteados, parentes, pessoas sob guarda ou responsabilidade direta da mulher ou integrantes de sua rede de apoio, com a finalidade de atingi-la.</p>
            </li>
          </ul>
          <p className="education-legal-note">A violência vicária foi incluída na Lei Maria da Penha pela <a href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15384.htm" target="_blank" rel="noreferrer">Lei nº 15.384/2026</a>.</p>

          <div className="support-guidance">
            <div>
              <span className="support-label">Como oferecer apoio</span>
              <h3>Escute, acolha e respeite o tempo dela.</h3>
              <p>Ouça sem julgar nem minimizar. Não pressione nem decida por ela. Preserve a confidencialidade e, se for possível e seguro, ofereça ajuda prática ou companhia para buscar um serviço.</p>
              <p>A rede de apoio não precisa resolver tudo. O mais importante é não culpabilizar a mulher e ajudá-la a encontrar caminhos com segurança.</p>
            </div>
            <aside className="education-help" aria-label="Canais de ajuda">
              <strong>Há risco imediato?</strong>
              <p>Se a violência estiver acontecendo ou houver perigo imediato, ligue para a Brigada Militar no <a href="tel:190">190</a>.</p>
              <p>Para orientação, acolhimento e informações sobre a rede, procure o <a href="#apoio">Ligue 180 ou a Escuta Lilás</a>.</p>
            </aside>
          </div>

          <div className="education-sources">
            <span>Conteúdo baseado em fontes oficiais:</span>
            <a href="https://www.gov.br/mulheres/pt-br/central-de-conteudos/noticias/2026/agosto-defeso-eleitoral/lei-maria-da-penha-conheca-os-seis-tipos-de-violencia-domestica-e-familiar-contra-a-mulher-previstos-na-lei" target="_blank" rel="noreferrer">Formas de violência · Ministério das Mulheres</a>
            <a href="https://www.gov.br/mulheres/pt-br/central-de-conteudos/noticias/2026/agosto-defeso-eleitoral/como-ser-rede-de-apoio-para-uma-mulher-em-situacao-de-violencia" target="_blank" rel="noreferrer">Como ser rede de apoio · Ministério das Mulheres</a>
          </div>
        </div>
      </section>

      <section className="support-contacts" id="apoio" aria-labelledby="support-title">
        <div className="section-label"><span>Rede de apoio</span></div>
        <div className="support-content">
          <div className="support-intro">
            <h2 id="support-title">Precisa de apoio?</h2>
            <p>Conheça os canais oficiais e escolha conforme a necessidade.</p>
          </div>
          <div className="support-list">
            <article className="support-item support-emergency">
              <div>
                <span className="support-label">Emergência imediata</span>
                <h3>Brigada Militar</h3>
                <p>Acione se a violência estiver acontecendo ou houver risco imediato.</p>
              </div>
              <a className="support-phone" href="tel:190" aria-label="Ligar para a Brigada Militar no 190">190</a>
              <a className="support-source" href="https://mulher.rs.gov.br/seguranca" target="_blank" rel="noreferrer">Secretaria da Mulher/RS</a>
            </article>
            <article className="support-item">
              <div>
                <span className="support-label">Orientação e denúncia</span>
                <h3>Central de Atendimento à Mulher</h3>
                <p>Gratuito, 24 horas. Orienta sobre direitos e serviços e recebe denúncias.</p>
              </div>
              <a className="support-phone" href="tel:180" aria-label="Ligar para a Central de Atendimento à Mulher no 180">180</a>
              <a className="support-source" href="https://www.gov.br/mulheres/pt-br/ligue180" target="_blank" rel="noreferrer">Ministério das Mulheres</a>
            </article>
            <article className="support-item">
              <div>
                <span className="support-label">Escuta e acolhimento no RS</span>
                <h3>Escuta Lilás</h3>
                <p>Canal estadual para escuta, acolhimento e orientação. Atendimento 24 horas.</p>
              </div>
              <a className="support-phone support-phone-long" href="tel:08005410803" aria-label="Ligar para a Escuta Lilás no 0800 541 0803">0800 541 0803</a>
              <a className="support-source" href="https://mulher.rs.gov.br/centro-especializado-de-atendimento-a-mulher" target="_blank" rel="noreferrer">Secretaria da Mulher/RS</a>
            </article>
          </div>
        </div>
      </section>

      <section className="methodology-section" id="metodologia" aria-labelledby="methodology-title">
        <div className="section-label"><span>Metodologia e fontes</span></div>
        <h2 className="visually-hidden" id="methodology-title">Metodologia e fontes</h2>
        <div className="methodology">
          <div className="methodology-facts">
            <article>
              <span>Recorte dos dados</span>
              <p>Feminicídios consumados registrados pela SSP-RS, por município e mês, de 2020 em diante.</p>
            </article>
            <article>
              <span>Período mais recente</span>
              <p>2026: janeiro a setembro. A planilha foi atualizada pela SSP-RS em 6 de outubro de 2026.</p>
            </article>
            <article>
              <span>Unidade do mapa</span>
              <p>Os números são agregados por município. A malha de referência contém os 497 municípios do RS, edição IBGE 2025.</p>
            </article>
          </div>

          <div className="methodology-reading">
            <h3>Como interpretar</h3>
            <p><strong>Zero</strong> significa que a planilha publicou zero casos naquele recorte. <strong>Dado indisponível</strong> indica que o mês não foi publicado; não é tratado como zero.</p>
            <p>Os dados refletem as planilhas oficiais disponíveis nas datas indicadas e podem ser revisados pela SSP-RS. A atualização dos arquivos desta versão foi manual; os dados foram conferidos antes da incorporação.</p>
            <p>O mapa não posiciona casos individuais e não infere endereços ou bairros. Os limites municipais servem à visualização temática, não a medições ou decisões sobre limites territoriais.</p>
          </div>

          <details className="methodology-history">
            <summary>Ver data de atualização das planilhas incluídas</summary>
            <div className="methodology-table-scroll" role="region" tabIndex={0} aria-label="Tabela de cobertura e atualização das planilhas SSP-RS">
              <table>
                <thead>
                  <tr><th scope="col">Ano dos dados</th><th scope="col">Meses publicados</th><th scope="col">Atualização informada</th><th scope="col">Visualize os dados</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">2026</th><td>Janeiro a setembro</td><td>6 out. 2026</td><td><AnnualDataDialog year={2026} /></td></tr>
                  <tr><th scope="row">2025</th><td>Janeiro a dezembro</td><td>6 out. 2026</td><td><AnnualDataDialog year={2025} /></td></tr>
                  <tr><th scope="row">2024</th><td>Janeiro a dezembro</td><td>5 jan. 2026</td><td><AnnualDataDialog year={2024} /></td></tr>
                  <tr><th scope="row">2023</th><td>Janeiro a dezembro</td><td>5 jan. 2026</td><td><AnnualDataDialog year={2023} /></td></tr>
                  <tr><th scope="row">2022</th><td>Janeiro a dezembro</td><td>6 jan. 2025</td><td><AnnualDataDialog year={2022} /></td></tr>
                  <tr><th scope="row">2021</th><td>Janeiro a dezembro</td><td>4 dez. 2023</td><td><AnnualDataDialog year={2021} /></td></tr>
                  <tr><th scope="row">2020</th><td>Janeiro a dezembro</td><td>5 mai. 2023</td><td><AnnualDataDialog year={2020} /></td></tr>
                </tbody>
              </table>
            </div>
          </details>

          <div className="methodology-network">
            <h3>Sobre a camada de serviços</h3>
            <p>O recorte reúne 84 serviços selecionados da IEDE/RS: 82 têm ponto público confirmado, 1 tem endereço público sem coordenada confirmada e 1 não tem endereço público. Esses dois últimos permanecem na lista textual. A fonte não informa a cobertura territorial da Patrulha Maria da Penha; delegacias comuns também não são incluídas sem classificação verificável.</p>
            <p><a href="https://iede.rs.gov.br/server/rest/services/SJCDH/locais_atendim_mulher_vitima_violencia/FeatureServer/0" target="_blank" rel="noreferrer">Consultar camada oficial da IEDE/RS</a>. Dados da Secretaria do Planejamento, Governança e Gestão do RS · licença CC BY-NC 4.0.</p>
          </div>

          <div className="methodology-sources">
            <span>Fontes:</span>
            <a href="https://www.ssp.rs.gov.br/indicadores-da-violencia-contra-a-mulher" target="_blank" rel="noreferrer">Indicadores da Violência Contra a Mulher · SSP-RS</a>
            <a href="https://www.ibge.gov.br/geociencias/todos-os-produtos-geociencias/15774-malhas.html" target="_blank" rel="noreferrer">Malhas territoriais · IBGE</a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="credits">
          <span>Trabalho da disciplina Gênero e Sexualidade · Faculdade de Educação · UFRGS</span>
          <span>Stefani Paz dos Santos · Thalyne Alves Arrieche</span>
        </div>
        <span>Rio Grande do Sul, Brasil</span>
        <span className="credits-developer">Desenvolvedor: Wesley Mateus Brombil · <a href="https://github.com/wbrombil" target="_blank" rel="noreferrer">GitHub</a></span>
      </footer>
    </main>
  )
}

export default App
