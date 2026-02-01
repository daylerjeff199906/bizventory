/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import {
  Check,
  ImageOff,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Eye
} from 'lucide-react'
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
import { useProductsAndVariants } from '@/hooks/use-products-variants'
import {
  CombinedResult,
  ProductVariantItem
} from '@/apis/app/productc.variants.list'
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

type ViewMode = 'products' | 'variants'

export const ProductSelectorModal = ({
  businessId,
  open,
  onOpenChange,
  onSelectProduct,
  selectedProductIds
}: ProductSelectorModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('products')
  const [selectedProduct, setSelectedProduct] = useState<CombinedResult | null>(
    null
  )

  const { fetchItems, items, loading } = useProductsAndVariants({
    businessId: businessId || undefined
  })

  useEffect(() => {
    if (open) {
      fetchItems(searchTerm)
      // Resetear al modo productos cuando se abre el modal
      setViewMode('products')
      setSelectedProduct(null)
    }
  }, [open, searchTerm])

  const handleSelectProduct = (product: CombinedResult) => {
    // Si el producto tiene variantes, navegar a la vista de variantes
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product)
      setViewMode('variants')
    } else {
      // Si no tiene variantes, seleccionar directamente
      onSelectProduct(product)
      onOpenChange(false)
    }
  }

  const handleSelectVariant = (variant: ProductVariantItem) => {
    if (!selectedProduct) return

    // Crear un CombinedResult para la variante seleccionada
    const variantProduct: CombinedResult = {
      ...selectedProduct,
      variant_id: variant.id,
      name: variant.name,
      description: variant.description || selectedProduct.description,
      code: variant.code,
      attributes: variant.attributes
    }

    onSelectProduct(variantProduct)
    onOpenChange(false)
  }

  const handleBackToProducts = () => {
    setViewMode('products')
    setSelectedProduct(null)
  }

  // Función para determinar si un producto/variante está seleccionado
  const isProductSelected = (product: CombinedResult): boolean => {
    return selectedProductIds.some(
      (sel) => String(product.id) === sel.productId
    )
  }

  const isVariantSelected = (variantId: string): boolean => {
    if (!selectedProduct) return false

    return selectedProductIds.some(
      (sel) =>
        String(selectedProduct.id) === sel.productId &&
        String(variantId) === sel.variantId
    )
  }

  const filteredItems = items

  // Vista de productos principales
  const renderProductsView = () => (
    <>
      {/* Búsqueda */}
      <SearchInput
        placeholder={'Buscar por nombre o descripción...'}
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Información sobre la selección */}
      <div className="border border-blue-200 dark:border-blue-600 rounded-lg p-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Nota:</strong> Los productos con variantes mostrarán sus
          variantes al hacer clic. Los productos simples se agregan
          directamente.
        </p>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <div className="h-full min-h-[200px]">
          <Table className="relative">
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead className="bg-muted">Producto</TableHead>
                <TableHead className="bg-muted">Unidad</TableHead>
                <TableHead className="bg-muted">Tipo</TableHead>
                <TableHead className="w-28 bg-muted"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredItems.map((product) => {
                  const isSelected = isProductSelected(product)
                  const hasVariants =
                    product.variants && product.variants.length > 0
                  const variantsCount = hasVariants
                    ? product?.variants?.length
                    : 0

                  return (
                    <TableRow
                      key={product.id}
                      className={cn(
                        isSelected && 'bg-muted/50',
                        'hover:bg-muted/30 cursor-pointer'
                      )}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={
                                  product.images[0]?.url || '/placeholder.svg'
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
                          <div className="min-w-0 flex-1 whitespace-normal max-w-[200px]">
                            <p className="text-sm break-words whitespace-normal line-clamp-2">
                              {product?.brand?.name && (
                                <span className="font-medium">
                                  {product.brand.name}
                                </span>
                              )}{' '}
                              {product.name}
                            </p>

                            {/* Información de variantes para productos con variantes */}
                            {hasVariants && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {variantsCount} variante
                                  {variantsCount !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            )}

                            {/* Mostrar código del producto */}
                            {product.code && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Código: {product.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="uppercase text-sm text-muted-foreground">
                        {product.unit}
                      </TableCell>

                      <TableCell>
                        {hasVariants ? (
                          <Badge variant="secondary" className="text-xs">
                            Con variantes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Simple
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {isSelected && !hasVariants && (
                          <span className="text-xs font-medium text-green-600 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Agregado
                          </span>
                        )}
                        {!isSelected && !hasVariants && (
                          <Button size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {!isSelected && hasVariants && (
                          <Button size="icon" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {isSelected && hasVariants && (
                          <span className="text-xs font-medium text-green-600 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Agregado
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )

  // Vista de variantes de un producto
  const renderVariantsView = () => {
    if (!selectedProduct) return null

    return (
      <>
        {/* Header con botón volver */}
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToProducts}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
          <div>
            <div className="mb-1 flex flex-col">
              <p className="text-sm">
                {selectedProduct?.brand?.name} {selectedProduct.name}
              </p>
              <p className="text-xs text-muted-foreground break-words whitespace-normal line-clamp-2">
                {selectedProduct?.description}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecciona una variante para agregar
            </p>
          </div>
        </div>

        {/* Lista de variantes */}
        <div className="flex-1 overflow-auto border rounded-lg">
          <div className="h-full min-h-[200px]">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="bg-muted">Variante</TableHead>
                  <TableHead className="bg-muted">Atributos</TableHead>
                  <TableHead className="w-28 bg-muted"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProduct.variants &&
                  selectedProduct.variants.length > 0 ? (
                  selectedProduct.variants.map((variant) => {
                    const isSelected = isVariantSelected(variant.id)

                    return (
                      <TableRow
                        key={variant.id}
                        className={cn(
                          isSelected && 'bg-muted/50',
                          'hover:bg-muted/30'
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 whitespace-normal max-w-[200px]">
                              {selectedProduct.images &&
                                selectedProduct.images.length > 0 ? (
                                <img
                                  src={
                                    selectedProduct.images[0]?.url ||
                                    '/placeholder.svg'
                                  }
                                  alt={variant.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 whitespace-nowrap max-w-[260px]">
                              <p className="text-sm font-medium break-words whitespace-normal line-clamp-2">
                                {variant.name}
                              </p>
                              {variant.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {variant.description}
                                </p>
                              )}
                              {variant.attributes &&
                                variant.attributes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {variant.attributes.map((attr, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {attr.attribute_type}: {attr.attribute_value}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {variant.code}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectVariant(variant)}
                            disabled={isSelected}
                            variant={isSelected ? 'secondary' : 'default'}
                            className={cn(
                              'min-w-24',
                              isSelected &&
                              'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
                            )}
                          >
                            {isSelected ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Agregada
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
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No se encontraron variantes para este producto
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col w-sm md:w-[600px] lg:w-[800px] min-w-[400px] md:min-w-[600px] lg:min-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {viewMode === 'products'
              ? 'Seleccionar Producto'
              : 'Seleccionar Variante'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {viewMode === 'products'
            ? renderProductsView()
            : renderVariantsView()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
