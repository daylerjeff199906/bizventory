/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Package,
  Check,
  Plus,
  ShoppingCart,
  AlertCircle,
  Box,
  Settings,
  X
} from 'lucide-react'
import type { Currency } from '@/types'
import { useProductsPrices } from '@/hooks/use-products-price'
import { SearchInput } from '@/components/app/search-input'
import type { ProductCombinedSelection, SelectedProductItem } from './types'
import type { Product } from '@/apis/app'

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (item: SelectedProductItem) => void
  addedProductIds: string[]
  currency: Currency
}

// Componente de configuración del producto (panel lateral)
function ProductConfigPanel({
  product,
  currency,
  onConfirm,
  onCancel
}: {
  product: ProductCombinedSelection
  currency: Currency
  onConfirm: (item: SelectedProductItem) => void
  onCancel: () => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [basePrice, setBasePrice] = useState(product.price_unit || 0)
  const [discountAmount, setDiscountAmount] = useState(0)

  const maxDiscount = basePrice * quantity
  const finalPrice = basePrice * quantity - discountAmount

  const handleConfirm = () => {
    const selectedItem: SelectedProductItem = {
      ...product,
      quantity,
      price_unit: basePrice,
      subtotal: finalPrice,
      discount: discountAmount,
      _temp_id: `temp-${product.product_id}-${product.variant_id || ''}`,
      attributes: product.attributes || [],
      code: product.code || '',
      variant_name: product.variant_name || '',
      product_name: product.product_name || '',
      product_description: product.product_description || '',
      stock: product.stock || 0,
      variant_id: product.variant_id || undefined,
      product_id: product.product_id,
      unit: product.unit || '',
      brand: product.brand || { id: '', name: '' }
    }
    onConfirm(selectedItem)
  }

  const isValidConfiguration = () => {
    return (
      quantity > 0 &&
      quantity <= (product.stock || 0) &&
      discountAmount <= basePrice * quantity &&
      discountAmount >= 0 &&
      basePrice > 0
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4 h-full max-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h3 className="font-medium text-sm">Detalles del Producto</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{product.code}</p>
            </div>
            <h4 className="font-medium text-sm">
              {product?.brand?.name || ''}
              {product.product_description}
              {product?.variant_id && product.variant_name
                ? ` - ${product.variant_name}`
                : ''}
              {product?.attributes && product.attributes.length > 0
                ? ` ${product.attributes
                    .map((attr) => `${attr.attribute_value}`)
                    .join(', ')}`
                : ''}
            </h4>

            <p className="text-xs text-muted-foreground mt-2">
              Stock disponible: {product.stock} {product.unit}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-sm">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock || 0}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="price" className="text-sm">
                Precio Unitario
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) =>
                  setBasePrice(Number.parseFloat(e.target.value) || 0)
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount" className="text-sm">
                Descuento Total
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max={maxDiscount}
                step="0.01"
                value={discountAmount}
                disabled={
                  basePrice <= 0 ||
                  quantity <= 0 ||
                  !product.stock ||
                  product.stock <= 0 ||
                  maxDiscount <= 0
                }
                onChange={(e) =>
                  setDiscountAmount(
                    Math.min(
                      maxDiscount,
                      Number.parseFloat(e.target.value) || 0
                    )
                  )
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Máximo: {currency}
                {maxDiscount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-md text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-sm  font-bold">
                {currency}
                {finalPrice.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-xs mt-1 text-red-600">
                <span>Descuento aplicado:</span>
                <span>
                  -{currency}
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t sticky bottom-0 bg-background">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidConfiguration()}
              className="flex-1"
              size="sm"
            >
              Agregar Producto
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// Componente de item de producto
function ProductItem({
  product,
  onSelect,
  isSelected,
  isConfiguring,
  currency
}: {
  product: ProductCombinedSelection
  onSelect: (product: ProductCombinedSelection) => void
  isSelected: boolean
  isConfiguring: boolean
  currency: Currency
}) {
  const isOutOfStock = !product.stock || product.stock <= 0

  return (
    <div
      className={`
      p-3 border shadow-none rounded-md transition-all hover:shadow-sm cursor-pointer
      ${isOutOfStock ? 'opacity-50 bg-muted/30' : 'hover:border-primary/20'}
      ${isSelected ? 'border-primary bg-primary/5' : ''}
      ${isConfiguring ? 'border-primary bg-primary/10' : ''}
    `}
      onClick={() => !isOutOfStock && !isSelected && onSelect(product)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <Box className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight">
                {product.brand?.name || ''} {product.product_description || ''}
                {product?.variant_id && product.variant_name}{' '}
                {product?.attributes && product.attributes.length > 0 && (
                  <>
                    {product.attributes
                      .map((attr) => `${attr.attribute_value}`)
                      .join(', ')}
                  </>
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Stock: {product.stock || 0} {product.unit}
              </span>
              {isOutOfStock && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>Sin stock</span>
                </div>
              )}
            </div>
            {product.price_unit && (
              <span className="text-sm font-medium">
                {currency}
                {product.price_unit.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(product)
          }}
          disabled={isOutOfStock || isSelected}
          className="flex-shrink-0 text-xs"
        >
          {isSelected ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Agregado
            </>
          ) : isConfiguring ? (
            <>
              <Settings className="h-3 w-3 mr-1" />
              Configurando
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export const transformProductsToCombinedSelection = (
  products: Product[]
): ProductCombinedSelection[] => {
  const result: ProductCombinedSelection[] = []

  products.forEach((product) => {
    if (
      product.has_variants &&
      product.variants &&
      product.variants.length > 0
    ) {
      product.variants.forEach((variant) => {
        result.push({
          product_id: product.id,
          variant_id: variant.id,
          code: variant.code || product.code,
          product_name: product.name,
          product_description: product.description,
          variant_name: variant.name,
          unit: product.unit,
          brand: product.brand,
          stock: variant.stock,
          price_unit: variant.price_unit,
          attributes: variant.attributes || [],
          _temp_id: `temp-${product.id}-${variant.id}`
        })
      })
    } else {
      result.push({
        product_id: product.id,
        code: product.code,
        product_name: product.name,
        product_description: product.description,
        unit: product.unit,
        brand: product.brand,
        stock: product.stock,
        price_unit: product.price_unit,
        _temp_id: `temp-${product.id}`
      })
    }
  })

  return result
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onAddProduct,
  addedProductIds,
  currency
}: ProductSelectionModalProps) {
  const { items: products, loading, fetchItems } = useProductsPrices()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] =
    useState<ProductCombinedSelection | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchItems({ searchQuery: searchTerm, page: 1, pageSize: 20 })
    }
  }, [isOpen, searchTerm])

  const listGeneralProducts = transformProductsToCombinedSelection(
    products?.data || []
  )

  const handleProductSelect = (product: ProductCombinedSelection) => {
    setSelectedProduct(product)
  }

  const handleProductConfirm = (item: SelectedProductItem) => {
    onAddProduct(item)
    setSelectedProduct(null)
  }

  const handleCancelConfig = () => {
    setSelectedProduct(null)
  }

  const isProductSelected = (tempId: string) => {
    return addedProductIds.includes(tempId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[80vw] md:max-w-[80vw] max-h-[90vh] overflow-hidden flex flex-col h-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Seleccionar Producto
          </DialogTitle>
          <DialogDescription>
            Busca y selecciona productos para agregar a la venta. Configura
            cantidad, precio y descuentos según sea necesario.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            {/* Panel izquierdo - Lista de productos */}
            <div className="col-span-1 md:col-span-2 flex flex-col h-full gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar productos</Label>
                <SearchInput
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              <ScrollArea className="flex-1 pr-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : listGeneralProducts.length > 0 ? (
                  <div className="space-y-3">
                    {listGeneralProducts.map((product) => (
                      <ProductItem
                        key={product._temp_id}
                        product={product}
                        onSelect={handleProductSelect}
                        isSelected={isProductSelected(product._temp_id || '')}
                        isConfiguring={
                          selectedProduct?._temp_id === product._temp_id
                        }
                        currency={currency}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-muted-foreground">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Panel derecho - Configuración del producto */}
            <div className="col-span-1 md:col-span-1 flex flex-col h-full">
              {selectedProduct && (
                <>
                  <div className="hidden md:block">
                    <Separator orientation="vertical" className="h-full" />
                  </div>
                  <div className="md:col-span-1 border rounded-md bg-background">
                    <ProductConfigPanel
                      product={selectedProduct}
                      currency={currency}
                      onConfirm={handleProductConfirm}
                      onCancel={handleCancelConfig}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
