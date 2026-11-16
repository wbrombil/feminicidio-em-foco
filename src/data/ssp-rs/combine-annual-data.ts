export type AnnualData = {
  year: number
  source: { publisher: string; title: string; url: string; updatedAt: string }
  statewideSource?: OctoberSupplement['source']
  coverage: {
    availableMonths: number[]
    municipalCompleteMonths?: number[]
    complementaryMonths?: number[]
  }
  statewide: { months: Record<string, number | null>; total: number }
  municipalities: Array<{ municipality: string; months: Record<string, number | null>; total: number }>
}

export type OctoberSupplement = {
  year: number
  month: number
  checkedAt: string
  source: { file: string; updatedAt: string; sheet: string; monthlyTotal: number; cumulativeTotal: number }
  records: Array<{
    id: string
    municipality: string
    count: number
    occurredAt: string
    publisher: string
    url: string
    evidence: string
  }>
}

// A supplement never changes the original JSON or fills unknown municipalities with zero.
export function combineAnnualData(base: AnnualData, supplement: OctoberSupplement): AnnualData {
  if (base.year !== 2026 || supplement.year !== 2026 || supplement.month !== 10
    || base.coverage.availableMonths.join(',') !== '1,2,3,4,5,6,7,8,9'
    || base.statewide.total !== 56 || supplement.source.monthlyTotal !== 9
    || supplement.source.cumulativeTotal !== 65) throw new Error('Complemento de outubro incompatível.')

  const names = new Set(base.municipalities.map((item) => item.municipality))
  const ids = new Set<string>()
  const counts = new Map<string, number>()
  for (const record of supplement.records) {
    if (!names.has(record.municipality) || !record.id || ids.has(record.id)
      || !Number.isInteger(record.count) || record.count <= 0
      || !/^2026-10-(0[1-9]|[12]\d|3[01])$/.test(record.occurredAt)
      || !record.publisher || !record.evidence || new URL(record.url).protocol !== 'https:') {
      throw new Error('Evidência municipal inválida ou duplicada.')
    }
    ids.add(record.id)
    counts.set(record.municipality, (counts.get(record.municipality) ?? 0) + record.count)
  }
  if ([...counts.values()].reduce((sum, count) => sum + count, 0) > 9) {
    throw new Error('Contagem complementar superior ao total oficial de outubro.')
  }
  return {
    ...base,
    statewideSource: { ...supplement.source },
    coverage: {
      ...base.coverage,
      availableMonths: [...base.coverage.availableMonths, 10],
      municipalCompleteMonths: [...base.coverage.availableMonths],
      complementaryMonths: [10],
    },
    statewide: { months: { ...base.statewide.months, '10': 9 }, total: 65 },
    municipalities: base.municipalities.map((item) => ({
      ...item,
      months: { ...item.months, '10': counts.get(item.municipality) ?? null },
      total: item.total + (counts.get(item.municipality) ?? 0),
    })),
  }
}
