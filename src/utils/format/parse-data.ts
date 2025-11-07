export const isNumberForRender = (
  value: number | string | null | undefined
): boolean => {
  return value !== null && value !== undefined && !isNaN(Number(value))
}
