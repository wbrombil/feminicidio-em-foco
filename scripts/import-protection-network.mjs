import { existsSync, readFileSync, renameSync, writeFileSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const outputPath = join(projectRoot, 'src', 'data', 'rede-protecao', 'services.json')
const temporaryOutputPath = `${outputPath}.tmp-${process.pid}`
const replaceExisting = process.argv.includes('--replace')
const sourceUrl = 'https://iede.rs.gov.br/server/rest/services/SJCDH/locais_atendim_mulher_vitima_violencia/FeatureServer/0'
const queryUrl = `${sourceUrl}/query?where=status%3D1&outFields=objectid,municipio,tp_unidade,telefone,email,endereco,complemento,horario_atendimento,fonte,nm_unidade,status,cod_ibge,mun_jurisdicionados,latitude,longitude&returnGeometry=true&outSR=4326&f=geojson`
const checkedAt = new Date().toISOString().slice(0, 10)
const selectedTypes = new Map([
  ['Centros de Referência de Atendimento à Mulher', 'crm'],
  ['Delegacia Especializada no Atendimento à Mulher (DEAM)', 'police-specialized'],
  ['Delegacia de Proteção a Grupos Vulneráveis', 'police-specialized'],
  ['Posto Policial de Proteção à Mulher (PPPM)', 'police-specialized'],
  ['Sala das Margaridas', 'acolhimento'],
  ['Sala Lilás', 'acolhimento'],
  ['Patrulha Maria da Penha', 'patrulha'],
  ['Juizado de Violência Doméstica e Familiar Contra a Mulher', 'justica'],
  ['Promotoria MPRS', 'promotoria'],
  ['Posto Médico-Legal (PML)', 'pml'],
])
const expectedCounts = new Map([
  ['Centros de Referência de Atendimento à Mulher', 54],
  ['Delegacia Especializada no Atendimento à Mulher (DEAM)', 22],
  ['Delegacia de Proteção a Grupos Vulneráveis', 7],
  ['Posto Policial de Proteção à Mulher (PPPM)', 1],
  ['Sala das Margaridas', 96],
  ['Sala Lilás', 9],
  ['Patrulha Maria da Penha', 119],
  ['Juizado de Violência Doméstica e Familiar Contra a Mulher', 14],
  ['Promotoria MPRS', 12],
  ['Posto Médico-Legal (PML)', 34],
])

function clean(value) {
  if (typeof value !== 'string') return null
  const result = value.trim()
  return result || null
}

if (existsSync(outputPath) && !replaceExisting) {
  throw new Error(`O snapshot já existe; revise a atualização e use --replace: ${outputPath}`)
}

const meshPath = join(projectRoot, 'src', 'data', 'ibge', 'rs-municipios-2025.geojson')
if (!existsSync(meshPath)) throw new Error(`Malha do IBGE não encontrada: ${meshPath}`)
const mesh = JSON.parse(readFileSync(meshPath, 'utf8'))
if (mesh.type !== 'FeatureCollection' || mesh.features.length !== 497) {
  throw new Error('A malha do IBGE deve conter 497 municípios antes da importação da rede.')
}
const municipalityByCode = new Map(mesh.features.map((feature) => [String(feature.properties?.CD_MUN), feature.properties?.NM_MUN]))
const municipalityCodes = new Set(municipalityByCode.keys())

const response = await fetch(queryUrl, { headers: { accept: 'application/geo+json, application/json' } })
if (!response.ok) throw new Error(`IEDE respondeu HTTP ${response.status}.`)
const source = await response.json()
if (source.type !== 'FeatureCollection' || !Array.isArray(source.features)) {
  throw new Error('Resposta GeoJSON inválida da camada da IEDE.')
}
if (source.exceededTransferLimit === true) {
  throw new Error('A IEDE informou que a resposta foi truncada; revise a paginação antes de importar.')
}

const filtered = source.features.filter((feature) => selectedTypes.has(feature.properties?.tp_unidade))
const actualCounts = new Map()
for (const feature of filtered) {
  const type = feature.properties.tp_unidade
  actualCounts.set(type, (actualCounts.get(type) ?? 0) + 1)
}
for (const [type, expected] of expectedCounts) {
  const actual = actualCounts.get(type) ?? 0
  if (actual !== expected) {
    throw new Error(`Quantidade de ${type} mudou (${expected} → ${actual}); revise a nova versão antes de gerar o snapshot.`)
  }
}

const seenIds = new Set()
const services = filtered.map((feature) => {
  const properties = feature.properties ?? {}
  const id = String(properties.objectid ?? '')
  const ibgeCode = String(properties.cod_ibge ?? '')
  if (!id || seenIds.has(id)) throw new Error(`ID de serviço ausente ou duplicado: ${id}`)
  if (!/^43\d{5}$/.test(ibgeCode) || !municipalityCodes.has(ibgeCode)) {
    throw new Error(`Código IBGE inválido ou fora da malha: ${properties.municipio} (${ibgeCode})`)
  }
  if (properties.status !== 1) throw new Error(`Serviço não ativo no filtro da fonte: ${id}`)
  seenIds.add(id)

  const hasPublicAddress = Boolean(clean(properties.endereco))
  const coordinates = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null
  const hasValidCoordinates = Array.isArray(coordinates)
    && coordinates.length >= 2
    && Number.isFinite(coordinates[0])
    && Number.isFinite(coordinates[1])
    && coordinates[0] >= -57.5 && coordinates[0] <= -49
    && coordinates[1] >= -33 && coordinates[1] <= -27

  return {
    id,
    municipality: municipalityByCode.get(ibgeCode),
    sourceMunicipality: clean(properties.municipio),
    ibgeCode,
    category: selectedTypes.get(properties.tp_unidade),
    officialType: properties.tp_unidade,
    name: clean(properties.nm_unidade),
    address: clean(properties.endereco),
    phone: clean(properties.telefone),
    email: clean(properties.email),
    hours: clean(properties.horario_atendimento),
    sourceName: clean(properties.fonte),
    sourceUrl,
    checkedAt,
    coordinates: hasPublicAddress && hasValidCoordinates ? [coordinates[1], coordinates[0]] : null,
  }
})

if (services.length !== 368) throw new Error(`Esperados 368 serviços selecionados; encontrados ${services.length}.`)
services.sort((a, b) => a.municipality.localeCompare(b.municipality, 'pt-BR') || a.officialType.localeCompare(b.officialType, 'pt-BR'))

const output = {
  schemaVersion: 1,
  checkedAt,
  source: {
    publisher: 'Infraestrutura Estadual de Dados Espaciais do Rio Grande do Sul (IEDE/RS)',
    serviceUrl: sourceUrl,
    queryUrl,
    license: 'CC BY-NC 4.0',
    attribution: 'Secretaria do Planejamento, Governança e Gestão do Estado do Rio Grande do Sul',
    note: 'A camada declara pontos geolocalizados a partir de endereços e não fornece data confiável da última edição. Registros sem endereço público mantêm coordinates=null.',
  },
  counts: Object.fromEntries(actualCounts),
  services,
}

const outputDirectory = dirname(outputPath)
await import('node:fs/promises').then(({ mkdir }) => mkdir(outputDirectory, { recursive: true }))
try {
  writeFileSync(temporaryOutputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  if (replaceExisting) renameSync(temporaryOutputPath, outputPath)
  else renameSync(temporaryOutputPath, outputPath)
} finally {
  if (existsSync(temporaryOutputPath)) unlinkSync(temporaryOutputPath)
}

console.log(`Snapshot da rede preparado: ${services.length} serviços (${[...actualCounts].map(([type, count]) => `${count} ${type}`).join('; ')}).`)
console.log(`Conferido em: ${checkedAt}`)
console.log(`Arquivo: ${outputPath}`)
