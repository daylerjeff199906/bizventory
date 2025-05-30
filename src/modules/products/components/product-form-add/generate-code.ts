export const generateProductCode = (): string => {
  const year = new Date().getFullYear()
  const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  //   const number = String(productsDB.length + 1).padStart(4, '0')
  return `PRD-${year}-${number}`
}
