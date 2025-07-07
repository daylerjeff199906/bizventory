'use client'
import { useState } from 'react'
import { BrandModal } from '../components'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function HeaderBrands() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Marca
      </Button>
      <BrandModal
        isOpen={isOpen}
        onClose={setIsOpen.bind(null, false)}
        onSuccess={() => setIsOpen(false)}
      />
    </div>
  )
}
