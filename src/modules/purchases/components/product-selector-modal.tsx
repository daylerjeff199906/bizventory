/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { Check, ImageOff, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/app/search-input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProductsAndVariants } from '@/hooks/use-products-variants'
import { CombinedResult } from '@/apis/app/productc.variants.list'
import { cn } from '@/lib/utils'

interface ProductSelectorModalProps {
  businessId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProduct: (product: CombinedResult) => void
  selectedProductIds: {
    productId: string | null
    variantId: string | null
  }[]
}

export const ProductSelectorModal = ({
  businessId,
  open,
  onOpenChange,
  onSelectProduct,
  selectedProductIds
}: ProductSelectorModalProps) => {
  const [searchType, setSearchType] = useState<'name' | 'code'>('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCode, setSearchCode] = useState<string>()

  const { fetchItems, items, loading } = useProductsAndVariants({
    businessId: businessId || undefined
  })

  useEffect(() => {
    if (open) {
      fetchItems(searchTerm)
    }
  }, [open, searchTerm, searchCode])

  const handleSelectProduct = (product: CombinedResult) => {
    onSelectProduct(product)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col w-sm md:w-[600px] lg:w-[800px] min-w-[400px] md:min-w-[600px] lg:min-w-[800px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Selector de tipo de búsqueda */}
          <Tabs
            value={searchType}
            onValueChange={(value) => {
              setSearchType(value as 'name' | 'code')
              setSearchTerm('') // Limpiar búsqueda al cambiar tipo
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="name">Buscar por Nombre</TabsTrigger>
              <TabsTrigger value="code">Buscar por Código</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Búsqueda */}
          <SearchInput
            placeholder={
              searchType === 'name'
                ? 'Buscar por nombre o marca...'
                : 'Buscar por código...'
            }
            value={searchTerm}
            onChange={
              searchType === 'name'
                ? (value) => setSearchTerm(value)
                : (value) => setSearchCode(value)
            }
          />
          {/* Lista de productos */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <div className="F h-full min-h-[200px]">
              <Table className="relative">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="bg-muted">Producto</TableHead>
                    <TableHead className="bg-muted">Unidad</TableHead>
                    <TableHead className="w-20 bg-muted"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        Cargando productos...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading &&
                    items.map((product) => {
                      const isVariant = product.variant_id !== undefined
                      const uuid = isVariant ? product.variant_id : product.id
                      const isSelected = product.variant_id
                        ? selectedProductIds.some(
                            (sel) =>
                              String(product.id) === sel.productId &&
                              String(product.variant_id) === sel.variantId
                          )
                        : selectedProductIds.some(
                            (sel) => String(product.id) === sel.productId
                          )

                      return (
                        <TableRow
                          key={uuid}
                          className={cn(
                            isSelected && 'bg-muted/50',
                            'hover:bg-muted/30'
                          )}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={
                                      product.images[0]?.url ||
                                      '/placeholder.svg'
                                    }
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <ImageOff className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm break-words whitespace-normal line-clamp-2">
                                  {product?.brand?.name && (
                                    <span className="font-medium">
                                      {product.brand.name}
                                    </span>
                                  )}{' '}
                                  {product.description}{' '}
                                  {product?.variant_name && (
                                    <span className="text-muted-foreground">
                                      ({product.variant_name})
                                    </span>
                                  )}
                                </p>
                                {product?.attributes &&
                                  product?.attributes?.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {product.attributes.map((attr) => (
                                        <Badge
                                          key={attr.attribute_type}
                                          variant="secondary"
                                          className="text-xs rounded-full"
                                        >
                                          {attr.attribute_value}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="uppercase text-sm text-muted-foreground">
                            {product.unit}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleSelectProduct(product)}
                              disabled={isSelected}
                              variant={isSelected ? 'secondary' : 'default'}
                              className={cn(
                                'min-w-20',
                                isSelected &&
                                  'bg-green-100 text-green-800 hover:bg-green-100'
                              )}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Agregado
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Agregar
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
