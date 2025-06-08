export const generatePurchaseCode = (): string => {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  //   const number = String(purchasesDB.length + 1).padStart(4, '0')
  const number = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `COMP-${year}${month}-${number}`
}
