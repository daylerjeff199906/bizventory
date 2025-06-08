'use client'

import { useState, type KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Agregar etiqueta...',
  maxTags
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      (!maxTags || tags.length < maxTags)
    ) {
      onChange([...tags, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleAddClick = () => {
    addTag(inputValue)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Eliminar etiqueta {tag}</span>
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={maxTags ? tags.length >= maxTags : false}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddClick}
          disabled={
            !inputValue.trim() || (maxTags ? tags.length >= maxTags : false)
          }
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Agregar etiqueta</span>
        </Button>
      </div>

      {maxTags && (
        <p className="text-sm text-muted-foreground">
          {tags.length} de {maxTags} etiquetas utilizadas
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Presiona Enter o coma para agregar una etiqueta. Usa Backspace para
        eliminar la última.
      </p>
    </div>
  )
}
