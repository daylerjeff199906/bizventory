/**
 * Convierte un número en su representación en palabras (Español)
 * Adaptado especialmente para montos de moneda peruana (Soles)
 */

const UNIDADES = ['', 'UN ', 'DOS ', 'TRES ', 'CUATRO ', 'CINCO ', 'SEIS ', 'SIETE ', 'OCHO ', 'NUEVE ']
const DECENAS = ['DIEZ ', 'ONCE ', 'DOCE ', 'TRECE ', 'CATORCE ', 'QUINCE ', 'DIECISEIS ', 'DIECISIETE ', 'DIECIOCHO ', 'DIECINUEVE ']
const DECENAS_COMPUESTAS = ['', 'DIEZ ', 'VEINTE ', 'TREINTA ', 'CUARENTA ', 'CINCUENTA ', 'SESENTA ', 'SETENTA ', 'OCHENTA ', 'NOVENTA ']
const CENTENAS = ['', 'CIENTO ', 'DOSCIENTOS ', 'TRESCIENTOS ', 'CUATROCIENTOS ', 'QUINIENTOS ', 'SEISCIENTOS ', 'SETECIENTOS ', 'OCHOCIENTOS ', 'NOVECIENTOS ']

function leerTresDigitos(num: number): string {
    let literal = ''
    const centenas = Math.floor(num / 100)
    const decenas = Math.floor((num % 100) / 10)
    const unidades = num % 10

    if (centenas > 0) {
        if (centenas === 1 && decenas === 0 && unidades === 0) {
            literal = 'CIEN '
        } else {
            literal = CENTENAS[centenas]
        }
    }

    if (decenas > 0) {
        if (decenas === 1) {
            literal += DECENAS[unidades]
        } else if (decenas === 2) {
            if (unidades === 0) literal += 'VEINTE '
            else literal += 'VEINTI' + UNIDADES[unidades]
        } else {
            literal += DECENAS_COMPUESTAS[decenas]
            if (unidades > 0) literal += 'Y ' + UNIDADES[unidades]
        }
    } else {
        if (unidades > 0) {
            literal += UNIDADES[unidades]
        }
    }

    return literal
}

export function numberToWords(number: number): string {
    if (number === 0) return 'CERO CON 00/100 SOLES'

    const entero = Math.floor(number)
    const centavos = Math.round((number - entero) * 100)

    let literal = ''

    if (entero > 0) {
        const millones = Math.floor(entero / 1000000)
        const miles = Math.floor((entero % 1000000) / 1000)
        const unidades = entero % 1000

        if (millones > 0) {
            if (millones === 1) literal += 'UN MILLON '
            else literal += leerTresDigitos(millones) + 'MILLONES '
        }

        if (miles > 0) {
            if (miles === 1) literal += 'MIL '
            else literal += leerTresDigitos(miles) + 'MIL '
        }

        if (unidades > 0) {
            literal += leerTresDigitos(unidades)
        }
    } else {
        literal = 'CERO '
    }

    const centavosStr = centavos.toString().padStart(2, '0')
    return `SON: ${literal}CON ${centavosStr}/100 SOLES`.replace(/\s+/g, ' ').trim()
}
