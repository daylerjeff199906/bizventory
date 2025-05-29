export interface ResApi<T> {
  data: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
  next_page?: number | null
  prev_page?: number | null
}
