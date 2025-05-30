'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
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
import { Product } from '@/types'
import { useProducts } from '@/hooks/use-products'
import { SearchInput } from '@/components/app/search-input'

interface ProductSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProduct: (product: Product) => void
  selectedProductIds: string[]
}

export const ProductSelectorModal = ({
  open,
  onOpenChange,
  onSelectProduct,
  selectedProductIds
}: ProductSelectorModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchProducts, setSearchProducts] = useState<string>()
  const [searchCode, setSearchCode] = useState<string>()

  const { products, loading: isLoadingProducts, fetchProducts } = useProducts()

  useEffect(() => {
    if (open) {
      fetchProducts({ query: searchTerm, code: searchCode })
    }
  }, [open, searchTerm, searchCode, fetchProducts])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand &&
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Búsqueda */}
          <SearchInput
            placeholder="Buscar por nombre, código o marca..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          {/* Lista de productos */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProducts && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando productos...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingProducts &&
                  filteredProducts.map((product) => {
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
                                  <span className="text-gray-400 text-xs">
                                    Sin foto
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.code}</Badge>
                        </TableCell>
                        <TableCell>{product.brand || 'Sin marca'}</TableCell>
                        <TableCell>{product.unit}</TableCell>
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
