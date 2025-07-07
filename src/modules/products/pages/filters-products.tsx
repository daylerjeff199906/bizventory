'use client'
import { SearchInput } from '@/components/app/search-input'
import { useFilterFromUrl } from '@/hooks/use-filter-from-url'

interface FiltersProductsProps {
  query?: string
  placeholder?: string
}

export const FiltersProducts = (props: FiltersProductsProps) => {
  const { query = 'name', placeholder } = props
  const { getParams, updateFilters } = useFilterFromUrl()

  const nameValue = getParams(`${query}`, '')

  const handleSearch = (value: string) => {
    if (value !== '') {
      updateFilters({ [query]: value })
    } else {
      updateFilters({ [query]: '' })
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-md">
        <SearchInput
          placeholder={placeholder || 'Buscar productos por nombre...'}
          onChange={handleSearch}
          value={nameValue}
        />
      </div>
    </div>
  )
}
