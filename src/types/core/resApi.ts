export interface ResApi<T> {
  data: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}
