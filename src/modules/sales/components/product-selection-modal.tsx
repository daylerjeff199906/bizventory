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
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Package,
  Check,
  AlertCircle,
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
  businessId: string
}

// Componente de configuración del producto (panel lateral)
function ProductConfigPanel({
  product,
  currency,
  onConfirm,
  onCancel,
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
      <ScrollArea className="flex-1 p-4 h-full max-h-[calc(100vh-100px)]">
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
          <div className="p-3 bg-muted rounded-md flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{product.code}</p>
            </div>
            <div
              className='cursor-pointer flex flex-col gap-1'
              title={
                `${product?.brand?.name || ''}
              ${product.product_description}
              ${product?.variant_id && product.variant_name
                  ? ` - ${product.variant_name}`
                  : ''}
              ${product?.attributes && product.attributes.length > 0
                  ? ` ${product.attributes
                    .map((attr) => `${attr.attribute_value}`)
                    .join(', ')}`
                  : ''}`
              }>
              <span className='text-xs text-muted-foreground'>
                {product?.brand?.name || ''}
              </span>
              <h3 className='text-sm font-medium'>
                {product?.product_description && product?.product_description.substring(0, 50)}
                {product?.variant_id && product.variant_name
                  ? ` - ${product.variant_name}`
                  : ''}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {product?.attributes && product.attributes.length > 0
                  ? ` ${product.attributes
                    .map((attr) => `${attr.attribute_value}`)
                    .join(', ')}`
                  : ''}
              </p>
            </div>

            <div className='flex items-center gap-2 justify-between'>
              <p className="text-sm text-muted-foreground mt-2">
                Stock: {product.stock} {product.unit}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Precio Unitario: {` `}
                <span className='font-medium text-emerald-600 text-lg'>
                  {product.price_unit} {' '}
                </span>
                {currency}
              </p>
            </div>
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

        {quantity > (product.stock || 0) && (
          <div className="p-3 mb-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm text-destructive font-medium">
              No puede agregar por que es mayor al stock ({product.stock})
            </div>
          </div>
        )}

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
      </ScrollArea >
    </div >
  )
}

// Componente de item de producto (Card Syle)
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
    <Card
      className={`
      overflow-hidden transition-all cursor-pointer group hover:shadow-md py-0
      ${isOutOfStock ? 'opacity-60' : ''}
      ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
      ${isConfiguring ? 'ring-2 ring-primary border-primary' : ''}
    `}
      onClick={() => !isOutOfStock && !isSelected && onSelect(product)}
    >
      <div className="h-32 w-full bg-muted flex items-center justify-center relative">
        {/* Placeholder de imagen */}
        <Package className="h-12 w-12 text-muted-foreground/30" />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
              AGOTADO
            </span>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="mb-2">
          <h4 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]" title={`${product.brand?.name || ''} ${product.product_name}`}>
            {product.brand?.name ? <span className="text-muted-foreground text-xs block">{product.brand.name}</span> : null}
            {product.product_name}
          </h4>
          <div className="text-xs text-muted-foreground truncate">
            {product.variant_name || product.code}
          </div>
          <div>
            {
              product.attributes?.map((attribute, index) => (
                <span key={index} className="text-xs text-muted-foreground">
                  {attribute.attribute_type}: {attribute.attribute_value}
                </span>
              ))
            }
          </div>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Precio</span>
            <span className="font-bold text-base">
              {currency} {product.price_unit?.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Stock</span>
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : ''}`}>
              {product.stock || 0}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const transformProductsToCombinedSelection = (
  products: Product[]
): ProductCombinedSelection[] => {
  console.log('Transforming products:', products) // Debug log
  const result: ProductCombinedSelection[] = []

  products.forEach((product) => {
    // Debug for specific issue
    if (product.has_variants && (!product.variants || product.variants.length === 0)) {
      console.warn('Product has variants flag but no variants data:', product.name)
    }

    // Check if variants exist and have items, ignoring has_variants flag as per user request
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant) => {
        result.push({
          product_id: product.id,
          variant_id: variant.id,
          code: variant.code || product.code,
          product_name: product.name,
          product_description: product.description,
          variant_name: variant.name,
          unit: product.unit,
          brand: {
            id: product.brand?.id ?? '',
            name: product.brand?.name ?? ''
          },
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
        brand: {
          id: String(product?.brand?.id),
          name: product?.brand?.name
        },
        stock: product.stock,
        price_unit: product.price_unit,
        _temp_id: `temp-${product.id}`
      })
    }
  })

  console.log('Transformation result:', result) // Debug log
  return result
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onAddProduct,
  addedProductIds,
  currency,
  businessId
}: ProductSelectionModalProps) {
  const { items: products, loading, fetchItems } = useProductsPrices()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] =
    useState<ProductCombinedSelection | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (isOpen) {
        fetchItems({ searchQuery: searchTerm, page: 1, pageSize: 20, businessId })
      }
    }
  }, [isOpen, searchTerm, businessId])

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
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 min-w-full">
        <div className="px-6 py-4 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Seleccionar Producto
            </DialogTitle>
            <DialogDescription>
              Selecciona productos del inventario
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Panel izquierdo - Lista de productos */}
          <div className={`flex flex-col h-full transition-all duration-300  ${selectedProduct ? 'w-full lg:w-3/4 border-r' : 'w-full'}`}>
            <div className="p-4 border-b bg-muted/20">
              <SearchInput
                placeholder="Buscar por nombre, código o marca..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="max-w-md w-full"
              />
            </div>

            <ScrollArea className="flex-1 p-4 h-full">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : listGeneralProducts.length > 0 ? (
                <div className={`
                        grid grid-cols-2 gap-4 pb-18
                        ${selectedProduct
                    ? 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    : 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}
                      `}>
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
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                  <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">
                    No se encontraron productos
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Panel derecho - Configuración */}
          {selectedProduct && (
            <div className="w-full lg:w-1/4 h-full bg-background absolute inset-0 lg:relative lg:inset-auto z-20 flex flex-col shadow-xl lg:shadow-none">
              <ProductConfigPanel
                product={selectedProduct}
                currency={currency}
                onConfirm={handleProductConfirm}
                onCancel={handleCancelConfig}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
