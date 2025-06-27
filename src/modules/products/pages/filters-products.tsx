'use client'
import { SearchInput } from '@/components/app/search-input'
import { useFilterFromUrl } from '@/hooks/use-filter-from-url'

export const FiltersProducts = () => {
  const { getParams, updateFilters } = useFilterFromUrl()

  const nameValue = getParams('name', '')

  const handleSearch = (value: string) => {
    if (value !== '') {
      updateFilters({ name: value })
    } else {
      updateFilters({ name: '' })
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-md">
        <SearchInput
          placeholder="Buscar productos por nombre"
          onChange={handleSearch}
          value={nameValue}
        />
      </div>
    </div>
  )
}
