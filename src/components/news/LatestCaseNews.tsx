import { useEffect, useState } from 'react'
import caseNewsUrl from '../../data/ssp-rs/case-news-2026.json?url'
import municipalityCrosswalkUrl from '../../data/ibge/ssp-rs-municipality-crosswalk.json?url'

type CaseNewsRecord = {
  municipality: string
  publisher: string
  url: string
  publishedAt: string | null
}

type MunicipalityCrosswalk = {
  sspMunicipality: string
  ibgeMunicipality: string
}

type Highlight = Omit<CaseNewsRecord, 'publishedAt'> & { publishedAt: string; municipalityLabel: string }

const formatDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function LatestCaseNews() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkedAt, setCheckedAt] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true

    async function loadHighlights() {
      try {
        const [newsResponse, crosswalkResponse] = await Promise.all([
          fetch(caseNewsUrl),
          fetch(municipalityCrosswalkUrl),
        ])
        if (!newsResponse.ok || !crosswalkResponse.ok) throw new Error('Falha ao carregar as fontes locais.')

        const newsData: { checkedAt?: unknown; records?: CaseNewsRecord[] } = await newsResponse.json()
        const crosswalkData: { municipalities?: MunicipalityCrosswalk[] } = await crosswalkResponse.json()
        if (!Array.isArray(newsData.records) || !Array.isArray(crosswalkData.municipalities)) {
          throw new Error('Formato inesperado nas fontes locais.')
        }

        const names = new Map(crosswalkData.municipalities.map((item) => [item.sspMunicipality, item.ibgeMunicipality]))
        const latest = newsData.records
          .filter((record): record is CaseNewsRecord & { publishedAt: string } => isValidDate(record.publishedAt))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
          .slice(0, 5)
          .map((record) => ({
            ...record,
            municipalityLabel: names.get(record.municipality) ?? record.municipality,
          }))

        if (active) {
          setHighlights(latest)
          setCheckedAt(isValidDate(newsData.checkedAt) ? newsData.checkedAt : null)
          setError(false)
        }
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadHighlights()
    return () => { active = false }
  }, [retry])

  return (
    <section className="latest-news" aria-labelledby="latest-news-title">
      <div className="latest-news-content">
        <header className="latest-news-header">
          <div>
            <h2 id="latest-news-title">Notícias recentes sobre feminicídios consumados</h2>
            {checkedAt ? <p className="latest-news-update">Referências conferidas em: {formatDate(checkedAt)}</p>
              : !loading && !error && <p className="latest-news-update">Data de conferência indisponível.</p>}
          </div>
          <p className="latest-news-date-note">A data indicada é a de publicação da matéria e não representa necessariamente a data da ocorrência.</p>
        </header>

        {error && (
          <div role="status">
            <p>Não foi possível carregar as referências recentes.</p>
            <button className="latest-news-retry" type="button" onClick={() => { setError(false); setLoading(true); setRetry((value) => value + 1) }}>Tentar novamente</button>
          </div>
        )}
        {loading && <p role="status">Carregando referências recentes…</p>}
        {!loading && !error && highlights.length === 0 && <p role="status">Nenhuma referência recente com data de publicação confirmada.</p>}
        {highlights.length > 0 && (
          <ol className="latest-news-list" aria-label="Cinco matérias mais recentes por data de publicação">
            {highlights.map((record) => (
              <li key={record.url}>
                <article className="latest-news-card">
                  <time dateTime={record.publishedAt}>{formatDate(record.publishedAt)}</time>
                  <p className="latest-news-municipality">{record.municipalityLabel}</p>
                  <p className="latest-news-publisher">{record.publisher}</p>
                  <a href={record.url} target="_blank" rel="noreferrer" aria-label={`Acessar matéria de ${record.publisher} sobre ${record.municipalityLabel}`}>
                    Acessar matéria <span aria-hidden="true">↗</span>
                  </a>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

export default LatestCaseNews
