import { readFileSync, renameSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const ibgeDirectory = join(projectRoot, 'src', 'data', 'ibge')
const generatedDirectory = join(projectRoot, 'src', 'data', 'ssp-rs', 'generated')
const geometryPath = join(ibgeDirectory, 'rs-municipios-2025.geojson')
const aliasesPath = join(ibgeDirectory, 'ssp-name-code-aliases.json')
const outputPath = join(ibgeDirectory, 'ssp-rs-municipality-crosswalk.json')
const temporaryOutputPath = `${outputPath}.tmp-${process.pid}`
const replaceExisting = process.argv.includes('--replace')
const years = Array.from({ length: 7 }, (_, index) => 2020 + index)

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function normalizeMunicipality(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

if (!existsSync(geometryPath)) {
  throw new Error(`GeoJSON do IBGE não encontrado: ${geometryPath}`)
}
if (existsSync(outputPath) && !replaceExisting) {
  throw new Error(`Crosswalk já existe; confira e use --replace para atualizá-lo: ${outputPath}`)
}

const geometry = readJson(geometryPath)
const aliases = readJson(aliasesPath)
if (geometry.type !== 'FeatureCollection' || geometry.features.length !== 497) {
  throw new Error('A malha deve conter exatamente 497 feições municipais do RS.')
}

const featureByCode = new Map()
const featuresByNormalizedName = new Map()
for (const feature of geometry.features) {
  const { CD_MUN: code, NM_MUN: name, SIGLA_UF: state } = feature.properties ?? {}
  if (!/^43\d{5}$/.test(String(code)) || state !== 'RS' || !name) {
    throw new Error(`Feição sem código, nome ou UF válida: ${JSON.stringify(feature.properties)}`)
  }
  if (feature.id !== String(code) || featureByCode.has(code)) {
    throw new Error(`ID/código IBGE inválido ou duplicado: ${code}`)
  }
  const normalizedName = normalizeMunicipality(name)
  if (featuresByNormalizedName.has(normalizedName)) {
    throw new Error(`Nome IBGE ambíguo após normalização: ${name}`)
  }
  featureByCode.set(code, feature)
  featuresByNormalizedName.set(normalizedName, feature)
}

const yearlyData = years.map((year) => {
  const path = join(generatedDirectory, `feminicidio-consumado-${year}.json`)
  const data = readJson(path)
  if (data.year !== year || data.municipalities.length !== 497) {
    throw new Error(`Estrutura anual inesperada: ${path}`)
  }
  return { year, municipalities: data.municipalities }
})

const firstYearNames = yearlyData[0].municipalities.map(({ municipality }) => municipality)
const sourceNameSet = new Set(firstYearNames)
if (sourceNameSet.size !== 497) {
  throw new Error('Há nomes SSP-RS duplicados no primeiro ano; crosswalk não gerado.')
}

const aliasNames = new Set(Object.keys(aliases))
const usedAliases = new Set()
const matches = firstYearNames.map((sourceName) => {
  let feature
  let method
  if (Object.hasOwn(aliases, sourceName)) {
    const code = aliases[sourceName]
    feature = featureByCode.get(code)
    method = 'alias-manual-por-codigo'
    if (!feature) throw new Error(`Alias aponta para código IBGE inexistente: ${sourceName} -> ${code}`)
    usedAliases.add(sourceName)
  } else {
    feature = featuresByNormalizedName.get(normalizeMunicipality(sourceName))
    method = 'nome-normalizado-unico'
    if (!feature) throw new Error(`Sem correspondência IBGE para o nome SSP-RS: ${sourceName}`)
  }

  return {
    sspMunicipality: sourceName,
    ibgeCode: feature.properties.CD_MUN,
    ibgeMunicipality: feature.properties.NM_MUN,
    matchMethod: method,
  }
})

if (usedAliases.size !== aliasNames.size) {
  const unused = [...aliasNames].filter((name) => !usedAliases.has(name))
  throw new Error(`Aliases sem uso nos dados SSP-RS: ${unused.join(', ')}`)
}
if (new Set(matches.map(({ ibgeCode }) => ibgeCode)).size !== 497) {
  throw new Error('A correspondência não é um-para-um; crosswalk não gerado.')
}

const firstYearMapping = new Map(matches.map(({ sspMunicipality, ibgeCode }) => [sspMunicipality, ibgeCode]))
for (const { year, municipalities } of yearlyData.slice(1)) {
  if (municipalities.length !== 497 || new Set(municipalities.map(({ municipality }) => municipality)).size !== 497) {
    throw new Error(`Nomes SSP-RS duplicados ou quantidade inesperada em ${year}.`)
  }
  for (const { municipality } of municipalities) {
    if (!sourceNameSet.has(municipality) || !firstYearMapping.has(municipality)) {
      throw new Error(`Município SSP-RS inesperado em ${year}: ${municipality}`)
    }
  }
}

const output = {
  schemaVersion: 1,
  sources: {
    sspRs: 'https://www.ssp.rs.gov.br/indicadores-da-violencia-contra-a-mulher',
    ibgeMesh: 'https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2025/UFs/RS/RS_Municipios_2025.zip',
    meshEdition: 2025,
  },
  matching: {
    normalizedExactNameMatches: matches.filter(({ matchMethod }) => matchMethod === 'nome-normalizado-unico').length,
    explicitCodeAliases: matches.filter(({ matchMethod }) => matchMethod === 'alias-manual-por-codigo').length,
  },
  municipalities: matches.sort((left, right) => left.ibgeCode.localeCompare(right.ibgeCode)),
}

try {
  writeFileSync(temporaryOutputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  if (replaceExisting) {
    renameSync(temporaryOutputPath, outputPath)
  } else {
    renameSync(temporaryOutputPath, outputPath)
  }
} finally {
  if (existsSync(temporaryOutputPath)) unlinkSync(temporaryOutputPath)
}

console.log(`Crosswalk validado: ${matches.length} municípios; ${output.matching.normalizedExactNameMatches} correspondências por nome e ${output.matching.explicitCodeAliases} aliases por código.`)
console.log(`Arquivo: ${outputPath}`)
