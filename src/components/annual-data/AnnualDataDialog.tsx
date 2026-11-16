import { loadAnnualData, type AnnualData } from '../../data/ssp-rs/load-annual-data'
import { useEffect, useMemo, useRef, useState } from 'react'



const monthLabels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const annualSourceUrl = 'https://www.ssp.rs.gov.br/indicadores-da-violencia-contra-a-mulher'
const desktopPageSize = 25

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M2.2 12s3.4-6.2 9.8-6.2 9.8 6.2 9.8 6.2-3.4 6.2-9.8 6.2S2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

function AnnualDataDialog({ year }: { year: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [data, setData] = useState<AnnualData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(desktopPageSize)

  const filteredMunicipalities = useMemo(() => {
    if (!data) return []
    const query = normalizeSearch(search.trim())
    return query
      ? data.municipalities.filter((item) => normalizeSearch(item.municipality).includes(query))
      : data.municipalities
  }, [data, search])
  const pageCount = Math.max(1, Math.ceil(filteredMunicipalities.length / pageSize))
  const visibleMunicipalities = filteredMunicipalities.slice((page - 1) * pageSize, page * pageSize)
  const municipalityColumnCharacters = Math.min(38, Math.max(22,
    ...visibleMunicipalities.map((municipality) => municipality.municipality.length + 2),
  ))
  const firstVisible = filteredMunicipalities.length ? (page - 1) * pageSize + 1 : 0
  const lastVisible = Math.min(page * pageSize, filteredMunicipalities.length)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => document.getElementById(`view-data-${year}`)?.focus()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [year])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const updatePageSize = (matches: boolean) => {
      setPageSize(matches ? 10 : desktopPageSize)
      setPage(1)
    }
    updatePageSize(media.matches)
    const handleChange = (event: MediaQueryListEvent) => updatePageSize(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  async function openDialog() {
    dialogRef.current?.showModal()
    if (data || loading) return
    setLoading(true)
    setError(false)
    try {
      const loaded = await loadAnnualData(year)
      const monthKeys = monthLabels.map((_, index) => String(index + 1).padStart(2, '0'))
      const municipalityNames = new Set<string>()
      const validSource = (() => {
        try {
          const sourceUrl = new URL(loaded.source.url)
          return sourceUrl.protocol === 'https:' && sourceUrl.hostname === 'www.ssp.rs.gov.br'
        } catch { return false }
      })()
      const validMunicipalities = Array.isArray(loaded.municipalities)
        && loaded.municipalities.length === 497
        && loaded.municipalities.every((municipality) => {
          const uniqueName = typeof municipality.municipality === 'string'
            && municipality.municipality.trim()
            && !municipalityNames.has(municipality.municipality)
          if (!uniqueName || !Number.isInteger(municipality.total) || municipality.total < 0
            || !municipality.months || typeof municipality.months !== 'object'
            || Array.isArray(municipality.months)
            || Object.keys(municipality.months).length !== 12
            || !monthKeys.every((key) => Object.hasOwn(municipality.months, key)
              && (municipality.months[key] === null
                || (Number.isInteger(municipality.months[key]) && (municipality.months[key] as number) >= 0)))) return false
          municipalityNames.add(municipality.municipality)
          return true
        })
      if (loaded.year !== year || !validSource || !validMunicipalities) {
        throw new Error('O arquivo anual tem uma estrutura inesperada.')
      }
      setData(loaded)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        id={`view-data-${year}`}
        className="annual-data-trigger"
        type="button"
        aria-label={`Visualizar dados municipais de ${year}`}
        onClick={() => void openDialog()}
      >
        <EyeIcon />
        <span>Visualizar dados</span>
      </button>
      <dialog className="annual-data-dialog" ref={dialogRef} aria-labelledby={`annual-dialog-title-${year}`}>
        <div className="annual-dialog-heading">
          <div>
            <h2 id={`annual-dialog-title-${year}`}>Dados municipais de {year}</h2>
            <p>Fonte: <a href={data?.source.url ?? annualSourceUrl} target="_blank" rel="noreferrer">SSP-RS — Indicadores da Violência Contra a Mulher</a>{data?.coverage.complementaryMonths?.length ? ' e referências complementares de outubro (ver metodologia e notícias no mapa).' : ''}</p>
          </div>
          <div className="annual-dialog-actions">
            {data && (
              <nav className="annual-data-pagination" aria-label={`Navegação dos municípios de ${year}`}>
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>Anterior</button>
                <span>Página {page} de {pageCount}</span>
                <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount}>Próxima</button>
              </nav>
            )}
            <button className="annual-dialog-close" type="button" aria-label="Fechar visualização dos dados" onClick={() => dialogRef.current?.close()}>×</button>
          </div>
        </div>
        <div className="annual-dialog-body">
          {loading && <p role="status">Carregando dados…</p>}
          {error && <p role="alert">Não foi possível carregar os dados municipais deste ano.</p>}
          {data && (
            <>
              {data.coverage.complementaryMonths?.length ? <p>Outubro: detalhamento municipal parcial, confirmado em fontes complementares. Total estadual SSP-RS: 65 no acumulado, incluindo 9 em outubro.</p> : null}
              <div className="annual-data-controls">
                <label htmlFor={`municipality-search-${year}`}>Buscar município
                  <input
                    id={`municipality-search-${year}`}
                    type="search"
                    value={search}
                    onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                    placeholder="Digite o nome"
                  />
                </label>
                <p aria-live="polite">{filteredMunicipalities.length} {filteredMunicipalities.length === 1 ? 'município' : 'municípios'} · exibindo {firstVisible}–{lastVisible}</p>
              </div>
              <div className="annual-data-table-scroll" role="region" tabIndex={0} aria-label={`Dados mensais de feminicídio consumado por município em ${year}`}>
                <table className="annual-data-table">
                  <caption>Feminicídios consumados registrados por município e mês — {year}</caption>
                  <colgroup>
                    <col className="annual-col-municipality" style={{ width: `max(12rem, ${municipalityColumnCharacters}ch)` }} />
                    {monthLabels.map((month) => <col className="annual-col-month" key={month} />)}
                    <col className="annual-col-total" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Município (SSP-RS)</th>
                      {monthLabels.map((month) => <th scope="col" key={month}>{month}</th>)}
                      <th scope="col">Total confirmado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMunicipalities.map((municipality) => (
                      <tr key={municipality.municipality}>
                        <th scope="row">{municipality.municipality}</th>
                        {monthLabels.map((month, index) => {
                          const value = municipality.months[String(index + 1).padStart(2, '0')]
                          return <td key={month}>{value === null ? 'Indisponível' : value}</td>
                        })}
                        <td>{municipality.total}</td>
                      </tr>
                    ))}
                    {visibleMunicipalities.length === 0 && <tr><td className="annual-data-empty" colSpan={14}>Nenhum município corresponde à busca.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="annual-data-mobile-list" aria-label={`Dados municipais de ${year}`}>
                {visibleMunicipalities.map((municipality) => (
                  <article className="annual-data-mobile-card" key={municipality.municipality}>
                    <h3>{municipality.municipality}</h3>
                    <dl>
                      {monthLabels.map((month, index) => {
                        const value = municipality.months[String(index + 1).padStart(2, '0')]
                        return <div key={month}><dt>{month}</dt><dd>{value === null ? 'Indisponível' : value}</dd></div>
                      })}
                      <div className="annual-data-mobile-total"><dt>Total confirmado</dt><dd>{municipality.total}</dd></div>
                    </dl>
                  </article>
                ))}
                {visibleMunicipalities.length === 0 && <p className="annual-data-empty">Nenhum município corresponde à busca.</p>}
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  )
}

export default AnnualDataDialog
