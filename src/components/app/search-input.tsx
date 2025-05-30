'use client'
import { Search } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  waitInterval?: number
}

const DEFAULT_WAIT_INTERVAL = 500

export const SearchInput = (props: SearchInputProps) => {
  const {
    placeholder,
    value = '',
    onChange,
    waitInterval = DEFAULT_WAIT_INTERVAL
  } = props

  const [inputValue, setInputValue] = useState(value)

  // Sincronizar el valor interno cuando cambia el valor prop
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSearch = useDebouncedCallback((value: string) => {
    if (onChange) {
      onChange(value)
    }
    // Si necesitas mantener la funcionalidad original con updateFilters
    // updateFilters({ [`${path}`]: value })
  }, waitInterval)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    handleSearch(newValue)
  }

  return (
    <section className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      <Input
        type="text"
        value={inputValue}
        placeholder={placeholder || 'Escribe para buscar...'}
        className="pl-10 w-full text-sm font-normal placeholder:text-gray-400"
        onChange={handleChange}
        aria-label="Search input"
      />
    </section>
  )
}
