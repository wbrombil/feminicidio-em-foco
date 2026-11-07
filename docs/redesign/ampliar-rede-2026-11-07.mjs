// Integra a consulta arquivada sem substituir os 84 registros anteriores.
import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/data/rede-protecao/services.json'
const previous = JSON.parse(await readFile(path, 'utf8'))
const input = JSON.parse(await readFile('docs/redesign/iede-consulta-2026-11-07.geojson', 'utf8'))
const mesh = JSON.parse(await readFile('src/data/ibge/rs-municipios-2025.geojson', 'utf8'))
const municipalities = new Map(mesh.features.map(feature => [String(feature.properties.CD_MUN), feature.properties.NM_MUN]))
const categories = new Map([
  ['Sala das Margaridas', ['acolhimento', 96]], ['Sala Lilás', ['acolhimento', 9]],
  ['Patrulha Maria da Penha', ['patrulha', 119]],
  ['Juizado de Violência Doméstica e Familiar Contra a Mulher', ['justica', 14]],
])
if (previous.services.length !== 84 || input.type !== 'FeatureCollection' || input.exceededTransferLimit) throw new Error('Dados de entrada inesperados')
const ids = new Set(previous.services.map(service => service.id))
const added = []
const counts = { ...previous.counts }
const clean = value => typeof value === 'string' && value.trim() ? value.trim() : null
for (const [officialType, [category, expected]] of categories) {
  const matches = input.features.filter(feature => feature.properties?.status === 1 && feature.properties.tp_unidade === officialType)
  if (matches.length !== expected) throw new Error(`Contagem inesperada: ${officialType}`)
  counts[officialType] = matches.length
  for (const feature of matches) {
    const p = feature.properties
    const id = String(p.objectid ?? '')
    const code = String(p.cod_ibge ?? '')
    const coordinates = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null
    if (!id || ids.has(id) || !municipalities.has(code) || !clean(p.endereco) || !Array.isArray(coordinates)
      || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])
      || coordinates[0] < -57.5 || coordinates[0] > -49 || coordinates[1] < -33 || coordinates[1] > -27) throw new Error(`Registro inválido: ${id}`)
    ids.add(id)
    added.push({ id, municipality: municipalities.get(code), sourceMunicipality: clean(p.municipio), ibgeCode: code,
      category, officialType, name: clean(p.nm_unidade), address: clean(p.endereco), phone: clean(p.telefone),
      email: clean(p.email), hours: clean(p.horario_atendimento), sourceName: clean(p.fonte),
      sourceUrl: previous.source.serviceUrl, checkedAt: '2026-11-07', coordinates: [coordinates[1], coordinates[0]] })
  }
}
const services = [...previous.services, ...added].sort((a, b) => a.municipality.localeCompare(b.municipality, 'pt-BR') || a.officialType.localeCompare(b.officialType, 'pt-BR'))
await writeFile('docs/redesign/rede-antes-ampliacao-2026-11-07.json', JSON.stringify(previous, null, 2) + '\n')
await writeFile(path, JSON.stringify({ ...previous, checkedAt: '2026-11-07', counts, services }, null, 2) + '\n')
console.log(`Preservados ${previous.services.length}; adicionados ${added.length}; total ${services.length}.`)
