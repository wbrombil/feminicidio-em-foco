import { availableYears, loadAnnualData, type AnnualData } from '../../data/ssp-rs/load-annual-data'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import L, { type GeoJSON as LeafletGeoJSON, type Path } from 'leaflet'
import { GeoJSON, MapContainer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import meshUrl from '../../data/ibge/rs-municipios-2025.geojson?url'
import crosswalkUrl from '../../data/ibge/ssp-rs-municipality-crosswalk.json?url'
import protectionNetworkUrl from '../../data/rede-protecao/services.json?url'
import contactEnrichmentsUrl from '../../data/rede-protecao/contact-enrichments.json?url'
import caseNewsUrl from '../../data/ssp-rs/case-news-2026.json?url'
import './MapExplorer.css'

type MunicipalityProperties = {
  CD_MUN: string
  NM_MUN: string
  SIGLA_UF: 'RS'
}

type MunicipalityFeature = Feature<Geometry, MunicipalityProperties>
type MunicipalityCollection = FeatureCollection<Geometry, MunicipalityProperties>

type Crosswalk = {
  municipalities: Array<{
    sspMunicipality: string
    ibgeCode: string
    ibgeMunicipality: string
  }>
}

type ServiceCategory = 'crm' | 'police-specialized' | 'acolhimento' | 'patrulha' | 'justica' | 'promotoria' | 'pml'

const serviceCategories: Record<ServiceCategory, { label: string; marker: string }> = {
  crm: { label: 'Centro de Referência da Mulher', marker: 'crm' },
  'police-specialized': { label: 'Unidade policial especializada', marker: 'police' },
  acolhimento: { label: 'Sala de acolhimento', marker: 'acolhimento' },
  patrulha: { label: 'Base da Patrulha Maria da Penha', marker: 'patrulha' },
  justica: { label: 'Juizado', marker: 'justica' },
  promotoria: { label: 'Promotoria especializada', marker: 'promotoria' },
  pml: { label: 'Posto Médico-Legal', marker: 'pml' },
}

type ProtectionService = {
  id: string
  municipality: string
  sourceMunicipality?: string | null
  ibgeCode: string
  category: ServiceCategory
  officialType: string
  name: string | null
  address: string | null
  phone: string | null
  email: string | null
  hours: string | null
  sourceName: string | null
  sourceUrl: string
  checkedAt: string
  coordinates: [number, number] | null
  contactEnrichment?: ContactEnrichment
}

function getServiceMarkerShape(service: ProtectionService) {
  return service.officialType === 'Sala das Margaridas' ? 'margarida' : serviceCategories[service.category].marker
}

type ContactEnrichment = {
  id: string
  source: {
    publisher: string
    url: string
    checkedAt: string
  }
  fields: {
    phone?: string
    email?: string
    hours?: string
    address?: string
    coordinates?: [number, number] | null
  }
  note?: string
}

type ContactEnrichments = {
  schemaVersion: number
  records: ContactEnrichment[]
}

type ProtectionNetwork = {
  schemaVersion: number
  checkedAt: string
  source: {
    serviceUrl: string
    license: string
    attribution: string
    note: string
  }
  services: ProtectionService[]
}


type CaseNewsRecord = {
  month: number
  municipality: string
  publisher: string
  title: string
  url: string
  publishedAt: string | null
  dateForOrdering: string | null
  publicationDateEvidence: string
  publicationDateNote?: string
  publicationDateDisplay?: string
}

type CaseNewsData = {
  schemaVersion: number
  checkedAt: string
  source: string
  records: CaseNewsRecord[]
}


const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const colors = {
  unavailable: '#ddd8cf',
  none: '#eee9e1',
  low: '#e8c8c3',
  medium: '#d59a94',
  high: '#9b3e4a',
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatIsoDate(value: string) {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function getServiceCoordinates(service: ProtectionService): [number, number] | null {
  if (service.contactEnrichment && Object.hasOwn(service.contactEnrichment.fields, 'coordinates')) {
    return service.contactEnrichment.fields.coordinates ?? null
  }
  return service.coordinates
}

function formatMonth(value: number) {
  return months[value - 1] ?? `mês ${value}`
}

function getCoverageText(availableMonths: number[], year: number) {
  if (availableMonths.length === 12) return `janeiro a dezembro de ${year}`
  if (availableMonths.length === 0) return `período disponível de ${year}`
  const isContinuous = availableMonths.every((value, index) => index === 0 || value === availableMonths[index - 1] + 1)
  const monthRange = isContinuous && availableMonths.length > 1
    ? `${formatMonth(availableMonths[0])} a ${formatMonth(availableMonths.at(-1) ?? availableMonths[0])}`
    : availableMonths.map(formatMonth).join(', ')
  return `${monthRange} de ${year}`
}

function getPeriodLabel(year: number, month: string, availableMonths: number[]) {
  return month ? `${formatMonth(Number(month))} de ${year}` : getCoverageText(availableMonths, year)
}

function fillForValue(value: number | null, selectedMonth: string) {
  if (value === null) return colors.unavailable
  if (value === 0) return colors.none
  if (selectedMonth) {
    if (value === 1) return colors.low
    if (value === 2) return colors.medium
    return colors.high
  }
  if (value <= 2) return colors.low
  if (value <= 5) return colors.medium
  return colors.high
}

function isValidMesh(value: unknown): value is MunicipalityCollection {
  if (!value || typeof value !== 'object') return false
  const collection = value as MunicipalityCollection
  if (collection.type !== 'FeatureCollection' || !Array.isArray(collection.features) || collection.features.length !== 497) return false

  const codes = new Set<string>()
  return collection.features.every((feature) => {
    const properties = feature.properties
    if (!properties || !/^43\d{5}$/.test(properties.CD_MUN) || properties.SIGLA_UF !== 'RS' || !properties.NM_MUN) return false
    if (feature.id !== properties.CD_MUN || codes.has(properties.CD_MUN)) return false
    codes.add(properties.CD_MUN)
    return feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon'
  })
}

function MapFocus({ feature }: { feature: MunicipalityFeature | null }) {
  const map = useMap()

  useEffect(() => {
    if (!feature) return
    const bounds = L.geoJSON(feature).getBounds()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [18, 18], maxZoom: 11, animate: !reduceMotion })
  }, [feature, map])

  return null
}

function ServiceFocus({ service }: { service: ProtectionService | null }) {
  const map = useMap()

  useEffect(() => {
    const coordinates = service ? getServiceCoordinates(service) : null
    if (!coordinates) return
    const zoom = Math.max(map.getZoom(), 8)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) map.setView(coordinates, zoom)
    else map.flyTo(coordinates, zoom, { duration: 0.45 })
  }, [map, service])

  return null
}

function MapViewportSync() {
  const map = useMap()
  const container = map.getContainer()

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false, debounceMoveend: true }))
    resizeObserver.observe(container)
    const timer = window.requestAnimationFrame(() => map.invalidateSize({ pan: false }))
    return () => {
      window.cancelAnimationFrame(timer)
      resizeObserver.disconnect()
    }
  }, [container, map])

  return null
}

function WheelZoomOnHold() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const enableWhileHeld = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (event.target instanceof Element && event.target.closest('.leaflet-control')) return
      map.scrollWheelZoom.enable()
    }
    const disableOnRelease = () => map.scrollWheelZoom.disable()

    container.addEventListener('pointerdown', enableWhileHeld)
    window.addEventListener('pointerup', disableOnRelease)
    window.addEventListener('pointercancel', disableOnRelease)
    window.addEventListener('blur', disableOnRelease)
    return () => {
      container.removeEventListener('pointerdown', enableWhileHeld)
      window.removeEventListener('pointerup', disableOnRelease)
      window.removeEventListener('pointercancel', disableOnRelease)
      window.removeEventListener('blur', disableOnRelease)
      disableOnRelease()
    }
  }, [map])

  return null
}

function MapAccessibility() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    container.setAttribute('role', 'region')
    container.setAttribute('aria-label', 'Mapa municipal do Rio Grande do Sul')
    container.setAttribute('aria-describedby', 'map-instructions')

    return () => {
      container.removeAttribute('role')
      container.removeAttribute('aria-label')
      container.removeAttribute('aria-describedby')
    }
  }, [map])

  return null
}

function AccessibleServiceMarker({
  service,
  selected,
  onSelect,
}: {
  service: ProtectionService
  selected: boolean
  onSelect: () => void
}) {
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    const element = markerRef.current?.getElement()
    if (!element) return

    element.setAttribute('role', 'button')
    element.setAttribute('tabindex', '0')
    element.setAttribute('aria-pressed', String(selected))
    const serviceType = serviceCategories[service.category].label
    element.setAttribute('aria-label', `${serviceType}: ${service.name ?? service.officialType}, ${service.municipality}`)
    const handleKeyDown: EventListener = (rawEvent) => {
      const event = rawEvent as KeyboardEvent
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      onSelect()
    }

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [onSelect, selected, service])

  const markerShape = getServiceMarkerShape(service)
  const markerIcon = useMemo(() => L.divIcon({
    className: 'network-marker-icon',
    html: `<span class="network-marker-shape network-marker-${markerShape}${selected ? ' is-selected' : ''}" aria-hidden="true"></span>`,
    iconSize: selected ? [22, 22] : [18, 18],
    iconAnchor: selected ? [11, 11] : [9, 9],
  }), [markerShape, selected])

  return (
    <Marker
      ref={markerRef}
      position={getServiceCoordinates(service)!}
      icon={markerIcon}
      eventHandlers={{ click: onSelect }}
    />
  )
}

function ServiceMarkers({
  services,
  selectedServiceId,
  onSelect,
}: {
  services: ProtectionService[]
  selectedServiceId: string | null
  onSelect: (service: ProtectionService) => void
}) {
  return services.map((service) => (
    <AccessibleServiceMarker
      key={service.id}
      service={service}
      selected={service.id === selectedServiceId}
      onSelect={() => onSelect(service)}
    />
  ))
}

function MapLegend({ selectedMonth }: { selectedMonth: string }) {
  const items = selectedMonth
    ? [
        { label: '0', color: colors.none },
        { label: '1', color: colors.low },
        { label: '2', color: colors.medium },
        { label: '3 ou mais', color: colors.high },
      ]
    : [
        { label: '0', color: colors.none },
        { label: '1–2', color: colors.low },
        { label: '3–5', color: colors.medium },
        { label: '6 ou mais', color: colors.high },
      ]

  return (
    <div className="map-legend" aria-label="Legenda da quantidade de registros por município">
      <span className="map-legend-title">Registros por município</span>
      {items.map((item) => (
        <span className="map-legend-item" key={item.label}>
          <span className="map-legend-swatch" style={{ backgroundColor: item.color }} aria-hidden="true" />
          {item.label}
        </span>
      ))}
      <span className="map-legend-item">
        <span className="map-legend-swatch" style={{ backgroundColor: colors.unavailable }} aria-hidden="true" />
        Indisponível
      </span>
    </div>
  )
}

export default function MapExplorer() {
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState('')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [mesh, setMesh] = useState<MunicipalityCollection | null>(null)
  const [crosswalk, setCrosswalk] = useState<Crosswalk | null>(null)
  const [network, setNetwork] = useState<ProtectionNetwork | null>(null)
  const [showCrms, setShowCrms] = useState(true)
  const [showSpecializedPolice, setShowSpecializedPolice] = useState(true)
  const [showAcolhimento, setShowAcolhimento] = useState(true)
  const [showPatrulha, setShowPatrulha] = useState(true)
  const [showJustica, setShowJustica] = useState(true)
  const [showPromotoria, setShowPromotoria] = useState(true)
  const [showPml, setShowPml] = useState(true)
  const [annualData, setAnnualData] = useState<AnnualData | null>(null)
  const [caseNews, setCaseNews] = useState<CaseNewsData | null>(null)
  const [caseNewsError, setCaseNewsError] = useState(false)
  const [baseError, setBaseError] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const [dataError, setDataError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [networkRetry, setNetworkRetry] = useState(0)
  const [newsRetry, setNewsRetry] = useState(0)
  const [networkRetrying, setNetworkRetrying] = useState(false)
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null)
  const municipalitySelectRef = useRef<HTMLSelectElement | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([fetch(meshUrl), fetch(crosswalkUrl)])
      .then(async ([meshResponse, crosswalkResponse]) => {
        if (!meshResponse.ok || !crosswalkResponse.ok) throw new Error('Falha ao ler a malha ou uma das tabelas municipais.')
        const [meshData, crosswalkData] = await Promise.all([meshResponse.json(), crosswalkResponse.json()])
        if (!isValidMesh(meshData) || !Array.isArray(crosswalkData.municipalities) || crosswalkData.municipalities.length !== 497) {
          throw new Error('A malha ou a correspondência municipal tem estrutura inesperada.')
        }
        const meshCodes = new Set<string>(meshData.features.map((feature: MunicipalityFeature) => feature.properties.CD_MUN))
        const crosswalkEntries = crosswalkData.municipalities as Crosswalk['municipalities']
        const crosswalkCodes = new Set<string>(crosswalkEntries.map((entry) => entry.ibgeCode))
        if (meshCodes.size !== 497 || crosswalkCodes.size !== 497 || [...crosswalkCodes].some((code) => !meshCodes.has(code))) {
          throw new Error('A correspondência municipal diverge da malha.')
        }
        return [meshData as MunicipalityCollection, crosswalkData as Crosswalk] as const
      })
      .then(([meshData, crosswalkData]) => {
        if (cancelled) return
        setMesh(meshData)
        setCrosswalk(crosswalkData)
      })
      .catch(() => {
        if (!cancelled) setBaseError(true)
      })

    return () => { cancelled = true }
  }, [retry])

  useEffect(() => {
    if (!mesh) return
    let cancelled = false

    Promise.all([fetch(protectionNetworkUrl), fetch(contactEnrichmentsUrl)])
      .then(async ([networkResponse, enrichmentResponse]) => {
        if (!networkResponse.ok) throw new Error('Falha ao ler o snapshot da rede de proteção.')
        if (!enrichmentResponse.ok) throw new Error('Falha ao ler a conferência complementar dos contatos.')
        return Promise.all([networkResponse.json(), enrichmentResponse.json()])
      })
      .then(([rawNetworkData, rawEnrichments]: [ProtectionNetwork, ContactEnrichments]) => {
        const networkData = rawNetworkData
        if (networkData.schemaVersion !== 1 || !Array.isArray(networkData.services) || !networkData.checkedAt) {
          throw new Error('O snapshot da rede de proteção tem estrutura inesperada.')
        }
        if (rawEnrichments.schemaVersion !== 1 || !Array.isArray(rawEnrichments.records)) {
          throw new Error('A conferência complementar dos contatos tem estrutura inesperada.')
        }
        const meshCodes = new Set(mesh.features.map((feature) => feature.properties.CD_MUN))
        const serviceIds = new Set<string>()
        for (const service of networkData.services) {
          if (!service.id || serviceIds.has(service.id) || !meshCodes.has(service.ibgeCode) || !service.municipality || !service.sourceUrl || !service.checkedAt) {
            throw new Error('O snapshot da rede contém serviço sem identificação, município, fonte ou data de conferência.')
          }
          if (!Object.hasOwn(serviceCategories, service.category)) throw new Error(`Categoria de serviço inesperada: ${service.category}`)
          if (service.coordinates && (service.coordinates.length !== 2 || !Number.isFinite(service.coordinates[0]) || !Number.isFinite(service.coordinates[1]))) {
            throw new Error(`Coordenadas inválidas para o serviço ${service.id}.`)
          }
          if (!service.address && service.coordinates) throw new Error(`Serviço sem endereço público não pode receber ponto no mapa: ${service.id}.`)
          serviceIds.add(service.id)
        }
        const enrichmentsById = new Map<string, ContactEnrichment>()
        for (const candidate of rawEnrichments.records as unknown[]) {
          if (!candidate || typeof candidate !== 'object') throw new Error('Registro complementar inválido.')
          const enrichment = candidate as ContactEnrichment
          const { source, fields } = enrichment
          if (!enrichment.id || !source || typeof source !== 'object' || !fields || typeof fields !== 'object' || Array.isArray(fields)) {
            throw new Error('A conferência complementar tem estrutura inválida.')
          }
          const fieldNames = Object.keys(fields)
          const validUrl = (() => {
            try { return new URL(source.url).protocol === 'https:' } catch { return false }
          })()
          if (!serviceIds.has(enrichment.id) || enrichmentsById.has(enrichment.id)
            || typeof source.publisher !== 'string' || !source.publisher.trim() || !validUrl
            || typeof source.checkedAt !== 'string' || !isValidIsoDate(source.checkedAt)
            || fieldNames.length === 0
            || fieldNames.some((field) => !['phone', 'email', 'hours', 'address', 'coordinates'].includes(field))) {
            throw new Error('A conferência complementar tem serviço, fonte ou campo inválido.')
          }
          for (const field of ['phone', 'email', 'hours', 'address'] as const) {
            if (Object.hasOwn(fields, field) && (typeof fields[field] !== 'string' || !fields[field]?.trim())) {
              throw new Error('A conferência complementar tem contato textual vazio ou inválido.')
            }
          }
          if (Object.hasOwn(fields, 'coordinates') && fields.coordinates !== null
            && (!Array.isArray(fields.coordinates) || fields.coordinates.length !== 2
              || !Number.isFinite(fields.coordinates[0]) || !Number.isFinite(fields.coordinates[1])
              || fields.coordinates[0] < -180 || fields.coordinates[0] > 180
              || fields.coordinates[1] < -90 || fields.coordinates[1] > 90)) {
            throw new Error('A conferência complementar tem coordenadas inválidas.')
          }
          if (fields.coordinates === null && (!fields.address || !enrichment.note)) {
            throw new Error('A supressão de ponto exige endereço conferido e justificativa.')
          }
          enrichmentsById.set(enrichment.id, enrichment)
        }
        const services = networkData.services.map((service) => ({
          ...service,
          contactEnrichment: enrichmentsById.get(service.id),
        }))
        if (!cancelled) {
          setNetwork({ ...networkData, services })
          setNetworkError(false)
          setNetworkRetrying(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNetworkError(true)
          setNetworkRetrying(false)
        }
      })

    return () => { cancelled = true }
  }, [mesh, networkRetry])

  useEffect(() => {
    let cancelled = false

    fetch(caseNewsUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Falha ao ler as referências jornalísticas.')
        return response.json()
      })
      .then((data: CaseNewsData) => {
        if (data.schemaVersion !== 2 || !data.checkedAt || !Array.isArray(data.records)) {
          throw new Error('O arquivo de referências jornalísticas tem estrutura inesperada.')
        }
        const keys = new Set<string>()
        for (const record of data.records) {
          const key = `${record.month}|${record.municipality}|${record.url}`
          if (!Number.isInteger(record.month) || record.month < 1 || record.month > 12
            || !record.municipality || !record.publisher || !record.title?.trim() || !record.url.startsWith('https://') || keys.has(key)
            || (record.publishedAt !== null && !isValidIsoDate(record.publishedAt))
            || (record.dateForOrdering !== null && !isValidIsoDate(record.dateForOrdering))
            || typeof record.publicationDateEvidence !== 'string' || !record.publicationDateEvidence.trim()) {
            throw new Error('Há uma referência jornalística inválida ou duplicada.')
          }
          keys.add(key)
        }
        if (!cancelled) {
          setCaseNews(data)
          setCaseNewsError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setCaseNewsError(true)
      })

    return () => { cancelled = true }
  }, [newsRetry])

  useEffect(() => {
    if (!crosswalk) return
    let cancelled = false

    loadAnnualData(year)
      .then((data: AnnualData) => {
        const codeBySspName = new Map(crosswalk.municipalities.map((entry) => [entry.sspMunicipality, entry.ibgeCode]))
        const codes = new Set<string>()
        if (data.year !== year || data.municipalities.length !== 497) throw new Error('Arquivo anual incompatível.')
        for (const municipality of data.municipalities) {
          const code = codeBySspName.get(municipality.municipality)
          if (!code || codes.has(code)) throw new Error('Correspondência municipal incompleta ou duplicada.')
          codes.add(code)
        }
        if (codes.size !== 497) throw new Error('Nem todos os municípios foram associados.')
        if (!cancelled) setAnnualData(data)
      })
      .catch(() => {
        if (!cancelled) setDataError(true)
      })

    return () => { cancelled = true }
  }, [crosswalk, retry, year])

  const codeBySspName = useMemo(
    () => new Map(crosswalk?.municipalities.map((entry) => [entry.sspMunicipality, entry.ibgeCode]) ?? []),
    [crosswalk],
  )

  const featureByCode = useMemo(
    () => new Map(mesh?.features.map((feature) => [feature.properties.CD_MUN, feature]) ?? []),
    [mesh],
  )

  const countByCode = useMemo(() => {
    const counts = new Map<string, number | null>()
    if (!annualData || annualData.year !== year) return counts
    const monthKey = month ? month.padStart(2, '0') : ''
    for (const municipality of annualData.municipalities) {
      const code = codeBySspName.get(municipality.municipality)
      if (code) counts.set(code, monthKey ? municipality.months[monthKey] : municipality.total)
    }
    return counts
  }, [annualData, codeBySspName, month, year])

  const currentData = annualData?.year === year ? annualData : null
  const selectedFeature = selectedCode ? featureByCode.get(selectedCode) ?? null : null
  const selectedService = network?.services.find((service) => service.id === selectedServiceId) ?? null
  const activeNetworkFilters = [showCrms, showSpecializedPolice, showAcolhimento, showPatrulha, showJustica, showPromotoria, showPml].filter(Boolean).length
  const filteredServices = (network?.services ?? []).filter((service) => (
    (service.category === 'crm' && showCrms) || (service.category === 'police-specialized' && showSpecializedPolice)
    || (service.category === 'acolhimento' && showAcolhimento) || (service.category === 'patrulha' && showPatrulha)
    || (service.category === 'justica' && showJustica)
    || (service.category === 'promotoria' && showPromotoria) || (service.category === 'pml' && showPml)
  ))
  const municipalityServices = filteredServices.filter((service) => !selectedCode || service.ibgeCode === selectedCode)
  const mappableServices = filteredServices.filter((service) => (
    getServiceCoordinates(service) && (!selectedCode || service.ibgeCode === selectedCode)
  ))
  const selectedServiceEnrichment = selectedService?.contactEnrichment
  const selectedServiceAddress = selectedServiceEnrichment?.fields.address ?? selectedService?.address
  const selectedServiceMapsUrl = selectedService && selectedServiceAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedServiceAddress}, ${selectedService.municipality}, RS`)}`
    : null
  const selectedServicePhone = selectedServiceEnrichment?.fields.phone ?? selectedService?.phone
  const selectedServiceEmail = selectedServiceEnrichment?.fields.email ?? selectedService?.email
  const selectedServiceHours = selectedServiceEnrichment?.fields.hours ?? selectedService?.hours
  const selectedServiceEmails = selectedServiceEmail?.split(/\s*\/\s*/).filter(Boolean) ?? []
  const selectedCount = selectedCode ? countByCode.get(selectedCode) ?? null : null
  const isPartialMunicipalAccumulation = !month && Boolean(currentData?.coverage.complementaryMonths?.length)
  const selectedSspMunicipality = selectedCode
    ? crosswalk?.municipalities.find((entry) => entry.ibgeCode === selectedCode)?.sspMunicipality ?? null
    : null
  const selectedCaseNews = year === 2026 && selectedSspMunicipality && caseNews
    ? caseNews.records
      .filter((record) => record.municipality === selectedSspMunicipality
        && currentData?.coverage.availableMonths.includes(record.month)
        && (!month || record.month === Number(month)))
      .sort((a, b) => (b.dateForOrdering ?? '').localeCompare(a.dateForOrdering ?? '')
        || a.publisher.localeCompare(b.publisher, 'pt-BR'))
    : []
  const availableMonths = currentData?.coverage.availableMonths ?? []
  const periodLabel = getPeriodLabel(year, month, availableMonths)
  const positiveMunicipalities = [...countByCode.values()].filter((value) => value !== null && value > 0).length
  const statewideCount = currentData
    ? month
      ? currentData.statewide.months[month.padStart(2, '0')] ?? null
      : currentData.statewide.total
    : null
  const coverageText = getCoverageText(availableMonths, year)
  const sourceUpdatedAt = currentData?.statewideSource?.updatedAt ?? currentData?.source.updatedAt
  const lastUpdated = sourceUpdatedAt
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${sourceUpdatedAt}T12:00:00Z`))
    : ''

  const municipalityOptions = useMemo(
    () => [...(mesh?.features ?? [])].sort((a, b) => a.properties.NM_MUN.localeCompare(b.properties.NM_MUN, 'pt-BR')),
    [mesh],
  )

  const chooseMunicipality = useCallback((code: string) => {
    setSelectedCode(code)
    setSelectedServiceId(null)
    setSelectionVersion((value) => value + 1)
  }, [])

  const chooseService = useCallback((service: ProtectionService) => {
    setSelectedCode(service.ibgeCode)
    setSelectedServiceId(service.id)
    setSelectionVersion((value) => value + 1)
  }, [])

  const styleFeature = useCallback((feature?: Feature) => {
    const code = String(feature?.properties && 'CD_MUN' in feature.properties ? feature.properties.CD_MUN : '')
    const value = countByCode.get(code) ?? null
    const isSelected = code === selectedCode
    return {
      color: isSelected ? '#28241f' : '#c7beb2',
      weight: isSelected ? 1.8 : 0.55,
      fillColor: fillForValue(value, month),
      fillOpacity: value === 0 ? 0.65 : 0.92,
    }
  }, [countByCode, month, selectedCode])

  const onEachFeature = useCallback((feature: Feature, layer: L.Layer) => {
    const properties = feature.properties as MunicipalityProperties | null
    if (!properties) return
    const code = properties.CD_MUN
    const path = layer as Path
    const value = countByCode.get(code) ?? null
    const valueLabel = value === null ? 'dado indisponível' : `${formatNumber(value)} registro(s)`
    layer.bindTooltip(`${properties.NM_MUN} — ${valueLabel} · ${periodLabel}`, { sticky: true })
    layer.on({
      click: () => chooseMunicipality(code),
      mouseover: () => path.setStyle({ color: '#28241f', weight: 1.6 }),
      mouseout: () => geoJsonRef.current?.resetStyle(path),
    })
  }, [chooseMunicipality, countByCode, periodLabel])

  const loadError = baseError || dataError
  const isLoading = !loadError && (!mesh || !crosswalk || annualData?.year !== year)

  return (
    <div className="map-explorer" aria-labelledby="map-title">
      <div className="map-explorer-heading">
        <div>
          <h2 id="map-title">Explore os dados por município</h2>
          <p>Selecione uma área no mapa ou busque um município. Os números reúnem dados da SSP-RS e referências complementares por município.</p>
        </div>
      </div>

      <div className="map-controls" aria-label="Filtros do mapa">
        <label>
          <span>Ano</span>
          <select value={year} onChange={(event) => { setYear(Number(event.target.value)); setMonth(''); setSelectedCode(null); setSelectedServiceId(null); setDataError(false) }}>
            {availableYears.map((availableYear) => (
              <option key={availableYear} value={availableYear}>{availableYear}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Mês</span>
            <select value={month} onChange={(event) => setMonth(event.target.value)} disabled={!currentData}>
            <option value="">Todos os meses disponíveis</option>
            {availableMonths.map((availableMonth) => (
              <option key={availableMonth} value={String(availableMonth)}>{formatMonth(availableMonth)}</option>
            ))}
          </select>
        </label>
        <label className="municipality-search">
          <span>Selecionar município</span>
          <select
            ref={municipalitySelectRef}
            value={selectedCode ?? ''}
            onChange={(event) => { setSelectedCode(event.target.value || null); setSelectedServiceId(null); setSelectionVersion((value) => value + 1) }}
            disabled={!mesh}
            aria-describedby="municipality-search-help"
          >
            <option value="">Selecione um município</option>
            {municipalityOptions.map((feature) => (
              <option key={feature.id} value={feature.properties.CD_MUN}>{feature.properties.NM_MUN}</option>
            ))}
          </select>
          <span className="visually-hidden" id="municipality-search-help">Digite as primeiras letras para localizar um município na lista.</span>
        </label>
      </div>

      {network && (
        <section className="network-controls" aria-labelledby="network-title">
          <div className="network-controls-heading">
            <div>
              <h3 id="network-title">Serviços da rede de proteção</h3>
              <p>Serviços de acolhimento, proteção policial e Justiça selecionados da camada estadual.</p>
            </div>
          </div>
          <details className="network-filter-disclosure">
            <summary>Filtros de serviços <span>{activeNetworkFilters} de 7 ativos</span></summary>
          <fieldset className="network-filters">
            <legend>Filtrar serviços no mapa</legend>
            <label><input type="checkbox" checked={showCrms} onChange={(event) => { setShowCrms(event.target.checked); if (!event.target.checked && selectedService?.category === 'crm') setSelectedServiceId(null) }} /> Centros de Referência da Mulher <span>{network.services.filter((service) => service.category === 'crm').length}</span></label>
            <label><input type="checkbox" checked={showSpecializedPolice} onChange={(event) => { setShowSpecializedPolice(event.target.checked); if (!event.target.checked && selectedService?.category === 'police-specialized') setSelectedServiceId(null) }} /> Unidades policiais especializadas <span>{network.services.filter((service) => service.category === 'police-specialized').length}</span></label>
            <label><input type="checkbox" checked={showAcolhimento} onChange={(event) => { setShowAcolhimento(event.target.checked); if (!event.target.checked && selectedService?.category === 'acolhimento') setSelectedServiceId(null) }} /> Salas de acolhimento <span>{network.services.filter((service) => service.category === 'acolhimento').length}</span></label>
            <label><input type="checkbox" checked={showPatrulha} onChange={(event) => { setShowPatrulha(event.target.checked); if (!event.target.checked && selectedService?.category === 'patrulha') setSelectedServiceId(null) }} /> Bases da Patrulha Maria da Penha <span>{network.services.filter((service) => service.category === 'patrulha').length}</span></label>
            <label><input type="checkbox" checked={showJustica} onChange={(event) => { setShowJustica(event.target.checked); if (!event.target.checked && selectedService?.category === 'justica') setSelectedServiceId(null) }} /> Juizados <span>{network.services.filter((service) => service.category === 'justica').length}</span></label>
            <label><input type="checkbox" checked={showPromotoria} onChange={(event) => { setShowPromotoria(event.target.checked); if (!event.target.checked && selectedService?.category === 'promotoria') setSelectedServiceId(null) }} /> Promotorias especializadas <span>{network.services.filter((service) => service.category === 'promotoria').length}</span></label>
            <label><input type="checkbox" checked={showPml} onChange={(event) => { setShowPml(event.target.checked); if (!event.target.checked && selectedService?.category === 'pml') setSelectedServiceId(null) }} /> Postos Médico-Legais <span>{network.services.filter((service) => service.category === 'pml').length}</span></label>
          </fieldset>
          </details>
        </section>
      )}
      {networkError && (
        <div className="network-load-note" role="status">
          <p>Não foi possível carregar a camada de serviços da rede. O mapa e os dados municipais continuam disponíveis.</p>
          <button type="button" className="retry-button" onClick={() => { setNetworkError(false); setNetworkRetrying(true); setNetworkRetry((value) => value + 1) }}>Tentar novamente</button>
        </div>
      )}
      {networkRetrying && <p className="network-load-note" role="status">Carregando serviços da rede…</p>}

      {currentData && (
        <div className="map-summary" aria-live="polite">
          <div><span>Registros no RS</span><strong>{statewideCount === null ? 'Indisponível' : formatNumber(statewideCount)}</strong></div>
          <div><span>Municípios com registros confirmados</span><strong>{formatNumber(positiveMunicipalities)} <small>de 497</small></strong></div>
          <div><span>Recorte exibido</span><strong>{month ? `${formatMonth(Number(month))} · ${year}` : coverageText}</strong></div>
        </div>
      )}

      {loadError ? (
        <div className="map-message map-message-error" role="alert">
          <p>Não foi possível carregar a malha ou os dados municipais.</p>
          <button type="button" onClick={() => { setBaseError(false); setDataError(false); setRetry((value) => value + 1) }}>Tentar novamente</button>
        </div>
      ) : isLoading ? (
        <div className="map-message" role="status">Carregando malha e dados oficiais…</div>
      ) : mesh && currentData ? (
        <div className={`map-workspace${selectedFeature || selectedService ? ' has-selection' : ''}`}>
          <div className="map-frame">
            {network && <a className="network-list-jump" href="#lista-servicos" onClick={(event) => {
              const summary = document.getElementById('lista-servicos')
              if (!(summary instanceof HTMLElement) || !(summary.parentElement instanceof HTMLDetailsElement)) return
              event.preventDefault()
              summary.parentElement.open = true
              summary.focus({ preventScroll: true })
              summary.scrollIntoView({ block: 'start' })
            }}>Ir para a lista de serviços</a>}
            <p className="visually-hidden" id="map-instructions">Mapa interativo do Rio Grande do Sul. Use a busca para selecionar um município ou os controles do mapa para ampliar e deslocar a visualização. Para ampliar ou reduzir com a roda do mouse ou trackpad, mantenha o botão principal pressionado sobre o mapa enquanto rola.</p>
            <MapContainer
              className="rs-map"
              center={[-30.8, -53.1]}
              zoom={5.7}
              minZoom={7}
              maxZoom={11}
              scrollWheelZoom={false}
              zoomControl
              preferCanvas
              maxBounds={[[-35.2, -59.5], [-26.3, -48.5]]}
              maxBoundsViscosity={0.85}
              worldCopyJump={false}
            >
              <MapAccessibility />
              <WheelZoomOnHold />
              <GeoJSON
                key={`${year}-${month || 'all'}`}
                ref={geoJsonRef}
                data={mesh as MunicipalityCollection}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
              <ServiceMarkers
                services={mappableServices}
                selectedServiceId={selectedServiceId}
                onSelect={chooseService}
              />
              <MapFocus feature={selectedFeature} />
              <ServiceFocus service={selectedService} />
              <MapViewportSync />
            </MapContainer>
          </div>

          <div className="map-sidebar">
            <section className="map-guide" aria-label="Legendas do mapa">
              <div className="map-key">
                <MapLegend selectedMonth={month} />
                <div className="network-legend" aria-label="Legenda dos serviços da rede">
                  <span><i className="network-dot network-dot-crm" aria-hidden="true" /> Centro de Referência da Mulher</span>
                  <span><i className="network-dot network-dot-acolhimento" aria-hidden="true" /> Sala Lilás</span>
                  <span><i className="network-dot-margarida" aria-hidden="true" /> Sala das Margaridas</span>
                  <span><i className="network-dot network-dot-police" aria-hidden="true" /> Unidade policial especializada</span>
                  <span><i className="network-dot network-dot-patrulha" aria-hidden="true" /> Base da Patrulha Maria da Penha</span>
                  <span><i className="network-dot network-dot-pml" aria-hidden="true" /> Posto Médico-Legal</span>
                  <span><i className="network-dot network-dot-justica" aria-hidden="true" /> Juizado</span>
                  <span><i className="network-dot network-dot-promotoria" aria-hidden="true" /> Promotoria especializada</span>
                </div>
              </div>
            </section>

            <aside className={`municipality-panel${selectedFeature || selectedService ? ' has-selection' : ''}`} aria-label="Leitura do mapa e detalhes da seleção">
              {(selectedFeature || selectedService) && (
                <div className="selection-toolbar">
                  {selectedFeature && <span className="municipality-panel-label">Município selecionado{selectedService ? `: ${selectedFeature.properties.NM_MUN}` : ''}</span>}
                  <button
                    type="button"
                    className="clear-selection"
                    onClick={() => {
                      if (selectedService) setSelectedServiceId(null)
                      else {
                        municipalitySelectRef.current?.focus()
                        setSelectedCode(null)
                      }
                    }}
                  >
                    Limpar seleção
                  </button>
                </div>
              )}
              <span className="visually-hidden" role="status" aria-live="polite">
                {selectedService ? `${selectedService.name ?? selectedService.officialType}, ${selectedService.municipality} selecionado.` : selectedFeature ? `Município ${selectedFeature.properties.NM_MUN} selecionado.` : ''}
              </span>
              {selectedService ? (
                <>
                  <span className="municipality-panel-label">{selectedService.officialType}</span>
                  <h3 className="selected-service-heading">
                    <i className={getServiceMarkerShape(selectedService) === 'margarida' ? 'network-dot-margarida' : `network-dot network-dot-${getServiceMarkerShape(selectedService)}`} aria-hidden="true" />
                    <span>{selectedService.name ?? `${selectedService.officialType} — ${selectedService.municipality}`}</span>
                  </h3>
                  <div className="selected-service-details">
                    <p>{selectedService.municipality}</p>
                    {selectedServiceAddress && <p className="network-service-detail">{selectedServiceAddress}</p>}
                    {selectedServicePhone && <p className="network-service-detail">Telefone: {selectedServicePhone}</p>}
                    {selectedServiceEmails.length > 0 && (
                      <p className="network-service-detail">
                        {selectedServiceEmails.map((email, index) => (
                          <span key={email}>{index > 0 && ' / '}<a href={`mailto:${email}`}>{email}</a></span>
                        ))}
                      </p>
                    )}
                    {selectedServiceHours && <p className="network-service-detail">Atendimento: {selectedServiceHours}</p>}
                    {selectedService.category === 'pml' && <p className="network-service-detail">O encaminhamento deve ser feito pela autoridade policial. Antes de ir, ligue para confirmar os horários. <a href="https://igp.rs.gov.br/onde-tem-posto-medico-legal" target="_blank" rel="noreferrer">Orientações do IGP-RS</a>.</p>}
                    <dl>
                      <div><dt>Conferido em</dt><dd>{selectedService.checkedAt}</dd></div>
                    </dl>
                    {selectedServiceMapsUrl && <a className="network-record-source" href={selectedServiceMapsUrl} target="_blank" rel="noreferrer">Ver endereço no Google Maps</a>}
                  </div>
                  {selectedServiceEnrichment && (
                    <div className="network-enrichment-source">
                      <p>Campos conferidos nesta fonte: {Object.keys(selectedServiceEnrichment.fields).filter((field) => field !== 'coordinates').map((field) => ({ phone: 'telefone', email: 'e-mail', hours: 'horário de atendimento', address: 'endereço' })[field as 'phone' | 'email' | 'hours' | 'address']).join(', ')}.</p>
                      <p><a href={selectedServiceEnrichment.source.url} target="_blank" rel="noreferrer">Consultar {selectedServiceEnrichment.source.publisher}</a></p>
                      <p>Conferido em {selectedServiceEnrichment.source.checkedAt}.</p>
                      {selectedServiceEnrichment.note && <p>{selectedServiceEnrichment.note}</p>}
                    </div>
                  )}
                </>
              ) : selectedFeature ? (
                <>
                  <h3>{selectedFeature.properties.NM_MUN}</h3>
                  <div className="municipality-count">{selectedCount === null ? '—' : formatNumber(selectedCount)}</div>
                  <p>{selectedCount === null ? 'Dado indisponível para o recorte selecionado.' : isPartialMunicipalAccumulation ? 'Subtotal municipal confirmado. O detalhamento de outubro é parcial.' : selectedCount === 0 ? 'Nenhum registro informado pela SSP-RS neste recorte.' : `registro${selectedCount === 1 ? '' : 's'} de feminicídio consumado no recorte.`}</p>
                  <dl>
                    <div><dt>Período</dt><dd>{periodLabel}</dd></div>
                    <div><dt>Código IBGE</dt><dd>{selectedFeature.properties.CD_MUN}</dd></div>
                  </dl>
                  {year === 2026 && (
                    <details className="network-directory case-news" key={`${year}-${month}-${selectedCode}-${selectionVersion}`}>
                      <summary id="case-news-title">Referências jornalísticas</summary>
                      <div className="case-news-content">
                        {caseNewsError ? (
                          <div role="status">
                            <p>Não foi possível carregar as referências jornalísticas. A contagem oficial permanece disponível.</p>
                            <button type="button" className="retry-button" onClick={() => { setCaseNewsError(false); setNewsRetry((value) => value + 1) }}>Tentar novamente</button>
                          </div>
                        ) : !caseNews ? (
                          <p role="status">Carregando referências jornalísticas…</p>
                        ) : selectedCount === null ? (
                          <p>Dado indisponível para o período selecionado.</p>
                        ) : selectedCount === 0 ? (
                          <p>{isPartialMunicipalAccumulation ? 'Nenhuma referência jornalística cadastrada para o subtotal confirmado deste município.' : 'Nenhum registro de feminicídio consumado publicado pela SSP-RS neste recorte.'}</p>
                        ) : (
                          <ol className="case-news-list">
                            {selectedCaseNews.map((record) => (
                              <li key={`${record.month}-${record.municipality}-${record.url}`}>
                              <article className="case-news-card">
                                <div className="case-news-card-heading">
                                  <h5>{record.publisher}</h5>
                                  <time dateTime={record.publishedAt ?? record.dateForOrdering ?? undefined} title={record.publicationDateNote ?? record.publicationDateEvidence}>
                                    {record.publishedAt ? formatIsoDate(record.publishedAt) : record.publicationDateDisplay ?? 'Data de publicação não informada'}
                                  </time>
                                </div>
                                <a href={record.url} target="_blank" rel="noreferrer">{record.title}<span className="visually-hidden">, abre em nova aba</span></a>
                                </article>
                              </li>
                            ))}
                            {selectedCaseNews.length === 0 && <li><p>Nenhuma referência jornalística registrada para este recorte.</p></li>}
                          </ol>
                        )}
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <>
                  <span className="municipality-panel-label">Leitura do mapa</span>
                  <h3>Escolha um município ou serviço</h3>
                </>
              )}
              {network && (
                <details className="network-directory">
                  <summary id="lista-servicos">Serviços da rede de proteção{selectedFeature ? ` em ${selectedFeature.properties.NM_MUN}` : ' no Rio Grande do Sul'}</summary>
                  <ul>
                    {municipalityServices.map((service) => {
                      const hasCoordinates = Boolean(getServiceCoordinates(service))
                      const hasPublicAddress = Boolean(service.contactEnrichment?.fields.address ?? service.address)
                      const locationStatus = hasCoordinates ? '' : hasPublicAddress ? ' · Coordenadas não confirmadas' : ' · Endereço público não informado'
                      const isSelected = service.id === selectedServiceId
                      return (
                        <li key={service.id}>
                          <button type="button" className={isSelected ? 'is-selected' : undefined} onClick={() => chooseService(service)}>
                            <strong>{service.name ?? `${service.officialType} — ${service.municipality}`}</strong>
                            <span>{service.municipality} · {service.officialType}{locationStatus}{isSelected ? ' · Serviço selecionado' : ''}</span>
                          </button>
                        </li>
                      )
                    })}
                    {municipalityServices.length === 0 && <li className="network-directory-empty">Nenhum serviço corresponde aos filtros neste recorte.</li>}
                  </ul>
                </details>
              )}
            </aside>
          </div>
        </div>
      ) : null}

      <div className="map-source-note">
        <span>Dados SSP-RS{currentData?.coverage.complementaryMonths?.length ? ' e fontes complementares' : ''} · atualização estadual: {lastUpdated || 'ver metadados do arquivo anual'}</span>
        <span>
          Malha municipal: <a href="https://www.ibge.gov.br/geociencias/todos-os-produtos-geociencias/15774-malhas.html" target="_blank" rel="noreferrer">IBGE, edição 2025</a>
          {' · '}
          <a href="https://www.ssp.rs.gov.br/indicadores-da-violencia-contra-a-mulher" target="_blank" rel="noreferrer">Fonte dos dados</a>
        </span>
      </div>
    </div>
  )
}
