export const generateVariantCode = (
  productCode: string,
  index: number
): string => {
  const paddedIndex = String(index).padStart(3, '0')
  return `${productCode}-V${paddedIndex}`
}
