export const generateVariantCode = (productCode: string): string => {
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const seconds = new Date().getSeconds().toString().padStart(2, '0')
  return `${productCode}-V${randomCode}${seconds}`
}
