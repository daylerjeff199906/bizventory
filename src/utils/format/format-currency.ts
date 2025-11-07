import { format } from "date-fns"
import { es } from "date-fns/locale"
export interface FormatCurrencyOptions {
  locale?: string // default 'es-PE'
  includeSymbol?: boolean // default true
  minimumFractionDigits?: number // default 2
  maximumFractionDigits?: number // default 2
}

/** Try to coerce various numeric string formats into a JS number. */
function parseNumber(input: number | string | null | undefined): number {
  if (input == null) return NaN
  if (typeof input === 'number') return input
  const s = String(input).trim()
  if (!s) return NaN

  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')

  let normalized = s
  if (lastComma > -1 && lastDot > -1) {
    // Both present: decide which is decimal by last occurrence
    if (lastComma > lastDot) {
      // comma as decimal separator: remove dots (thousands), replace last comma with dot
      normalized = s.replace(/\./g, '').replace(/,([^,]*)$/, '.$1')
    } else {
      // dot as decimal separator: remove commas (thousands)
      normalized = s.replace(/,/g, '')
    }
  } else if (lastComma > -1) {
    // only comma present -> treat as decimal separator
    normalized = s.replace(/,/g, '.')
  } else {
    // only dots or no separator -> remove commas just in case
    normalized = s
  }

  // Remove any non-digit (except leading -, + and decimal point)
  const cleaned = normalized.replace(/[^\d+\-\.eE]/g, '')
  return Number(cleaned)
}

/**
 * Format a value as Peruvian soles.
 * Returns empty string for null/undefined/NaN inputs.
 */
export default function formatCurrencySoles(
  value: number | string | null | undefined,
  opts: FormatCurrencyOptions = {}
): string {
  const {
    locale = 'es-PE',
    includeSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = opts

  const num = parseNumber(value)
  if (!isFinite(num)) return ''

  if (includeSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'PEN',
      currencyDisplay: 'symbol',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(num)
  }

  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num)
}

/*
Example usages:
formatCurrencySoles(1234.5)           // "S/ 1,234.50" (locale may vary)
formatCurrencySoles("1.234,56")       // "S/ 1,234.56"
formatCurrencySoles("1234.56", { includeSymbol: false }) // "1,234.56"
*/

export interface FormatDateOptions {
  locale?: string // default 'es-PE'
  dateStyle?: 'short' | 'medium' | 'long' | 'full' // default 'medium'
  timeStyle?: 'short' | 'medium' | 'long' | 'full' | undefined
  timeZone?: string
  includeTime?: boolean // if true and timeStyle not provided, defaults to 'short'
}

/** Try to parse various date inputs into a Date, return null if invalid */
function parseDate(input: string | Date | null | undefined): Date | null {
  if (input == null) return null
  if (input instanceof Date) return isFinite(input.getTime()) ? input : null
  const d = new Date(String(input))
  return isFinite(d.getTime()) ? d : null
}

/**
 * Format an ISO date/time (e.g. "2025-11-04T00:00:00+00:00") or Date into a localized string.
 * Returns empty string for null/undefined/invalid inputs.
 */
export function formatDateString(
  value: string | Date | null | undefined,
  opts: FormatDateOptions = {}
): string {
  const {
    locale = 'es-PE',
    dateStyle = 'medium',
    timeStyle,
    includeTime = false
  } = opts

  const date = parseDate(value)
  if (!date) return ''

  // Map dateStyle/timeStyle to date-fns tokens (P/PP/PPP/PPPP for localized date, p/pp/pppp for time)
  const dateMap: Record<string, string> = {
    short: 'P',
    medium: 'PP',
    long: 'PPP',
    full: 'PPPP'
  }
  const timeMap: Record<string, string> = {
    short: 'p',
    medium: 'pp',
    long: 'pppp',
    full: 'pppp'
  }

  const dateToken = dateMap[dateStyle] ?? dateMap['medium']
  const chosenTimeStyle = timeStyle ?? (includeTime ? 'short' : undefined)
  const timeToken = chosenTimeStyle ? (timeMap[chosenTimeStyle] ?? timeMap['short']) : ''

  const pattern = timeToken ? `${dateToken} ${timeToken}` : dateToken

  // Use date-fns locale when possible; fall back to default formatting if locale unsupported
  const dfLocale = locale && locale.startsWith('es') ? es : undefined

  // date-fns does not handle arbitrary time zones without additional libraries (date-fns-tz);
  // for simplicity we ignore opts.timeZone here. If timeZone support is required, replace with date-fns-tz usage.
  return format(date, pattern, { locale: dfLocale })
}

/*
Examples:
formatDateString('2025-11-04T00:00:00+00:00')                // "4 nov 2025" (es-PE, medium)
formatDateString('2025-11-04T00:00:00+00:00', { dateStyle: 'short' }) // "04/11/25"
formatDateString('2025-11-04T00:00:00+00:00', { includeTime: true }) // "4 nov 2025 00:00"
*/