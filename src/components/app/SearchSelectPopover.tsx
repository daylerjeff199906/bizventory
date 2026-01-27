'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { SearchInput } from './search-input'
import { useDebouncedCallback } from 'use-debounce'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SearchSelectOption = {
  id: string
  name: string
  [key: string]: unknown // Permite propiedades adicionales sin usar any
}

interface SearchSelectPopoverProps {
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  loadingText?: string
  defaultValue?: SearchSelectOption | null
  options: SearchSelectOption[]
  isLoading?: boolean
  onSearch?: (searchTerm: string) => void
  onChange?: (selectedId: string) => void
  required?: boolean
  label?: string
  className?: string
  delay?: number
}

export const SearchSelectPopover = ({
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'No se encontraron resultados',
  loadingText = 'Cargando...',
  defaultValue = null,
  options = [],
  isLoading = false,
  onSearch,
  onChange,
  required = false,
  label,
  className = '',
  delay = 300
}: SearchSelectPopoverProps) => {
  const [open, setOpen] = useState(false)
  const [selectedOption, setSelectedOption] =
    useState<SearchSelectOption | null>(defaultValue)
  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (onSearch) {
      onSearch(value)
    }
  }, delay)

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleSelect = (optionId: string) => {
    const selected = options.find((option) => option.id === optionId) || null
    setSelectedOption(selected)
    if (onChange) {
      onChange(optionId)
    }
    setOpen(false)
  }

  return (
    <div className={`${className}`}>
      {label && (
        <div className="pb-4 h-fit">
          <p className="text-sm font-medium leading-none ">
            {label}
            {required && <span className="text-red-500">*</span>}
          </p>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            size="sm"
            aria-expanded={open}
            className="w-full justify-between flex gap-2 border rounded-md px-4 py-[18px]"
          >
            {selectedOption ? (
              <p className="text-sm font-medium truncate">
                {selectedOption.name}
              </p>
            ) : (
              <div className="text-sm uppercase">{placeholder}</div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0 md:min-w-[320px] lg:min-w-[400px] xl:min-w-[500px]"
          onEscapeKeyDown={() => setOpen(false)}
          align="start"
        >
          <Command>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm font-medium uppercase">
                    {loadingText}
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={() => handleSelect(option.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedOption?.id === option.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span className="truncate">{option.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
