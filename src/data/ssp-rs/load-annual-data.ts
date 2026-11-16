import data2020Url from './generated/feminicidio-consumado-2020.json?url'
import data2021Url from './generated/feminicidio-consumado-2021.json?url'
import data2022Url from './generated/feminicidio-consumado-2022.json?url'
import data2023Url from './generated/feminicidio-consumado-2023.json?url'
import data2024Url from './generated/feminicidio-consumado-2024.json?url'
import data2025Url from './generated/feminicidio-consumado-2025.json?url'
import data2026Url from './generated/feminicidio-consumado-2026.json?url'
import supplementUrl from './october-2026.json?url'
import { combineAnnualData, type AnnualData, type OctoberSupplement } from './combine-annual-data'

export type { AnnualData } from './combine-annual-data'

const dataUrls: Record<number, string> = {
  2020: data2020Url, 2021: data2021Url, 2022: data2022Url, 2023: data2023Url,
  2024: data2024Url, 2025: data2025Url, 2026: data2026Url,
}

export const availableYears = Object.keys(dataUrls).map(Number).sort((a, b) => b - a)

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Falha ao ler os dados anuais.')
  return response.json()
}

export async function loadAnnualData(year: number): Promise<AnnualData> {
  if (!Object.hasOwn(dataUrls, year)) throw new Error('Ano indisponível.')
  const base = await readJson<AnnualData>(dataUrls[year])
  if (year !== 2026) return base
  return combineAnnualData(base, await readJson<OctoberSupplement>(supplementUrl))
}
