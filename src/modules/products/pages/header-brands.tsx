'use client'
import { useState } from 'react'
import { BrandModal } from '../components'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface HeaderBrandsProps {
  businessId?: string
}

export default function HeaderBrands({ businessId }: HeaderBrandsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Marca
      </Button>
      <BrandModal
        isOpen={isOpen}
        businessId={businessId}
        onClose={setIsOpen.bind(null, false)}
        onSuccess={() => setIsOpen(false)}
      />
    </div>
  )
}
