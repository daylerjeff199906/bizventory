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
