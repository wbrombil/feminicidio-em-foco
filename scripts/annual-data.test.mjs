import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { combineAnnualData } from '../src/data/ssp-rs/combine-annual-data.ts'

const read = async (name) => JSON.parse(await readFile(new URL(`../src/data/ssp-rs/${name}`, import.meta.url), 'utf8'))
const base = await read('generated/feminicidio-consumado-2026.json')
const supplement = await read('october-2026.json')
const news = await read('case-news-2026.json')

test('combines official total and partial municipalities without changing historical data', () => {
  const snapshot = structuredClone(base)
  const combined = combineAnnualData(base, supplement)
  assert.equal(combined.statewide.total, 65)
  assert.equal(combined.statewide.months['10'], 9)
  assert.equal(combined.municipalities.reduce((sum, m) => sum + m.total, 0), 61)
  assert.deepEqual(combined.coverage.availableMonths, [1,2,3,4,5,6,7,8,9,10])
  for (const [i, m] of combined.municipalities.entries()) {
    for (let month = 1; month <= 9; month++) assert.equal(m.months[String(month).padStart(2,'0')], base.municipalities[i].months[String(month).padStart(2,'0')])
    assert.equal(m.months['11'], null)
    assert.equal(m.months['12'], null)
    assert.equal(m.months['10'], supplement.records.some(r => r.municipality === m.municipality) ? 1 : null)
  }
  assert.deepEqual(base, snapshot)
  assert.deepEqual(combineAnnualData(base, supplement), combined)
  assert.throws(() => combineAnnualData(combined, supplement))
})

test('rejects duplicate cases, unknown municipalities, invalid counts and excess totals', () => {
  for (const change of [
    s => s.records.push(s.records[0]),
    s => { s.records[0].municipality = 'UNKNOWN' },
    s => { s.records[0].count = -1 },
    s => { s.records[0].count = 1.5 },
    s => { s.records[0].count = 10 },
    s => { s.records[0].occurredAt = '2026-11-01' },
    s => { s.source.cumulativeTotal = 37 },
  ]) {
    const copy = structuredClone(supplement)
    change(copy)
    assert.throws(() => combineAnnualData(base, copy))
  }
})

test('each complementary occurrence has a matching editorial reference', () => {
  for (const r of supplement.records) {
    const matching = news.records.filter(n => n.supplementId === r.id)
    assert.equal(matching.length, 1)
    assert.equal(matching[0].month, 10)
    assert.equal(matching[0].municipality, r.municipality)
    assert.equal(matching[0].url, r.url)
  }
})
