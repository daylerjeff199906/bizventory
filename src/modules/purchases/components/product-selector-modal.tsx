/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { ImageOff, Plus } from 'lucide-react'
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

interface ProductSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProduct: (product: CombinedResult) => void
  selectedProductIds: string[]
}

export const ProductSelectorModal = ({
  open,
  onOpenChange,
  onSelectProduct,
  selectedProductIds
}: ProductSelectorModalProps) => {
  const [searchType, setSearchType] = useState<'name' | 'code'>('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCode, setSearchCode] = useState<string>()

  const { fetchItems, items, loading } = useProductsAndVariants()

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  {/* <TableHead>Código</TableHead> */}
                  <TableHead>Unidad</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando productos...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  items.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id)
                    return (
                      <TableRow
                        key={product.id}
                        className={isSelected ? 'bg-gray-50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={
                                    product.images[0]?.url || '/placeholder.svg'
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <ImageOff className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="font-medium text-sm">
                              {product?.brand?.name && (
                                <>{product.brand.name}</>
                              )}{' '}
                              {product.description}{' '}
                              {product?.variant_name && (
                                <>{product.variant_name}</>
                              )}
                              {product?.attributes &&
                                product?.attributes?.length > 0 && (
                                  <div className="mt-1">
                                    {product.attributes.map((attr) => (
                                      <Badge
                                        key={attr.attribute_type}
                                        className="mr-1 text-xs rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                                      >
                                        {attr.attribute_value}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">
                          {product.unit}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectProduct(product)}
                            disabled={isSelected}
                            variant={isSelected ? 'secondary' : 'default'}
                          >
                            {isSelected ? (
                              'Agregado'
                            ) : (
                              <Plus className="h-4 w-4" />
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
      </DialogContent>
    </Dialog>
  )
}
