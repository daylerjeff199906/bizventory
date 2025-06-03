'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

export interface ComboboxItem {
  value: string
  label: string
}

interface ComboboxProps {
  items: ComboboxItem[]
  placeholder?: string
  emptyMessage?: string
  defaultValue?: string
  defaultSearchValue?: string
  value?: string
  onValueChange?: (value: string) => void
  onSearchChange?: (search: string) => void
  searchValue?: string
  disabled?: boolean
  className?: string
  isLoading?: boolean
  loadingMessage?: string
}

export function Combobox({
  items,
  placeholder = 'Seleccionar opción...',
  emptyMessage = 'No se encontraron resultados.',
  defaultValue = '',
  defaultSearchValue = '',
  value,
  onValueChange,
  onSearchChange,
  searchValue,
  disabled = false,
  className,
  isLoading = false,
  loadingMessage = 'Cargando resultados...'
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [internalSearchValue, setInternalSearchValue] =
    React.useState(defaultSearchValue)

  // Usar valor controlado o interno
  const currentValue = value !== undefined ? value : internalValue
  const currentSearchValue =
    searchValue !== undefined ? searchValue : internalSearchValue

  // Encontrar el item seleccionado
  const selectedItem = items.find((item) => item.value === currentValue)

  const handleValueChange = (newValue: string) => {
    const finalValue = currentValue === newValue ? '' : newValue

    if (value === undefined) {
      setInternalValue(finalValue)
    }

    onValueChange?.(finalValue)
    setOpen(false)
  }

  const handleSearchChange = (search: string) => {
    if (searchValue === undefined) {
      setInternalSearchValue(search)
    }

    onSearchChange?.(search)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar..."
            value={currentSearchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p>{loadingMessage}</p>
                </div>
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={handleValueChange}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          currentValue === item.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
