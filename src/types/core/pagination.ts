export interface Pagination {
  page?: number
  pageSize?: number
  searchQuery?: string
}

export interface ResponsePagination<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
