// Compara os resumos capturados no navegador com os JSONs anuais locais.
import { readFile, writeFile } from 'node:fs/promises'

const reportPath = 'docs/redesign/entrega-2026-11-06/matriz-dados-2026-11-07.json'
const matrix = JSON.parse(await readFile(reportPath, 'utf8'))
const mismatches = []
const expectedKeys = new Set()
for (let year = 2020; year <= 2026; year++) {
  const data = JSON.parse(await readFile(`src/data/ssp-rs/generated/feminicidio-consumado-${year}.json`, 'utf8'))
  expectedKeys.add(`${year}:`)
  for (const month of data.coverage.availableMonths) expectedKeys.add(`${year}:${month}`)
}
const observedKeys = new Set()
for (const row of matrix.mapa) {
  const data = JSON.parse(await readFile(`src/data/ssp-rs/generated/feminicidio-consumado-${row.year}.json`, 'utf8'))
  const month = row.month.value ? String(row.month.value).padStart(2, '0') : null
  const key = `${row.year}:${row.month.value}`
  if (observedKeys.has(key)) mismatches.push({ key, reason: 'recorte repetido' })
  observedKeys.add(key)
  const expected = [month ? data.statewide.months[month] : data.statewide.total, data.municipalities.filter(item => (month ? item.months[month] : item.total) > 0).length]
  const lines = row.summary.split('\n')
  const observed = [Number(lines[1].replaceAll('.', '')), Number(lines[3].split(' ')[0].replaceAll('.', ''))]
  if (String(expected) !== String(observed)) mismatches.push({ key, expected, observed })
}
const missing = [...expectedKeys].filter(key => !observedKeys.has(key))
const extra = [...observedKeys].filter(key => !expectedKeys.has(key))
const result = { checked: matrix.mapa.length, expected: expectedKeys.size, mismatches, missing, extra, note: 'Compara resumo do mapa capturado com arquivos JSON locais; não audita planilhas originais ou todos os municípios.' }
await writeFile('docs/redesign/entrega-2026-11-06/comparacao-matriz.json', JSON.stringify(result, null, 2), 'utf8')
console.log(JSON.stringify(result, null, 2))
if (mismatches.length || missing.length || extra.length) process.exitCode = 1
