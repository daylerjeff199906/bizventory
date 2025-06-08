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
import { Badge } from '@/components/ui/badge'
import { Package, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import type { Currency, SaleItemInput } from '@/types'
import { useProductsPrices } from '@/hooks/use-products-price'
import { Product, ProductVariant } from '@/apis/app'
import { SearchInput } from '@/components/app/search-input'
import { CombinedResultPrice } from './types'
import { ScrollArea } from '@radix-ui/react-scroll-area'

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProduct: (item: SaleItemInput) => void
  onUpdateProduct?: (tempId: string, item: SaleItemInput) => void
  addedProductIds: string[]
  currency: Currency
  editMode?: boolean
  editingProduct?: SaleItemInput
  editingTempId?: string
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  onAddProduct,
  onUpdateProduct,
  addedProductIds,
  currency,
  editMode = false,
  editingProduct,
  editingTempId
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] =
    useState<CombinedResultPrice | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [expandedProducts, setExpandedProducts] = useState<string[]>([])

  const currencySymbol = currency === 'PEN' ? 'S/' : '$'

  const { items: products, loading, fetchItems } = useProductsPrices()

  const productsWithUniqueIds = products?.data.map((product) => ({
    ...product,
    temp_id: `temp_${product.id}`
  }))

  useEffect(() => {
    if (isOpen) {
      fetchItems({
        searchQuery: searchTerm
      })
    }
  }, [isOpen, searchTerm])

  useEffect(() => {
    if (isOpen === false) {
      setSearchTerm('')
      setSelectedProduct(null)
      setQuantity(1)
      setUnitPrice(0)
      setDiscount(0)
      setExpandedProducts([])
    }
  }, [isOpen])

  const handleProductSelect = (product: Product | ProductVariant) => {
    // Solo permitir selección si tiene stock
    if ((product.stock ?? 0) <= 0) return

    setSelectedProduct(product)
    setUnitPrice(Number(product.price) || 0)

    if (!editMode) {
      setQuantity(1)
      setDiscount(0)
    }
  }

  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleAddOrUpdateProduct = () => {
    if (!selectedProduct) return

    const totalPrice = unitPrice * quantity - discount
    const isVariant =
      'product_id' in selectedProduct &&
      selectedProduct.product_id !== undefined

    const productItem: SaleItemInput = {
      temp_id: editMode && editingTempId ? editingTempId : generateTempId(),
      product_id: String(
        isVariant ? selectedProduct?.product_id : selectedProduct?.id
      ),
      product_name: `${selectedProduct.brand?.name || ''} ${
        selectedProduct.name || selectedProduct.description || ''
      }${isVariant ? ` - ${selectedProduct.name || ''}` : ''}`,
      quantity,
      unit_price: unitPrice,
      discount_amount: discount,
      total_price: totalPrice
    }

    if (editMode && onUpdateProduct && editingTempId) {
      onUpdateProduct(editingTempId, productItem)
    } else {
      onAddProduct(productItem)
    }

    onClose()
  }

  const isProductAdded = (productId: string) => {
    if (editMode && editingProduct && editingProduct.product_id === productId) {
      return false
    }
    return addedProductIds.includes(productId)
  }

  const handleClose = () => {
    onClose()
  }

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const getFullProductName = (product: CombinedResultPrice): string => {
    const brandName = product.brand?.name || ''
    const productName = product.name || product.description || ''
    const variantName = product.variant_name ? ` - ${product.variant_name}` : ''

    let attributesText = ''
    if (
      product.variant_id &&
      product.attributes &&
      product.attributes.length > 0
    ) {
      attributesText = ` (${product.attributes
        .map((attr) => attr.attribute_value)
        .join(', ')})`
    }

    return `${brandName} ${productName}${variantName}${attributesText}`.trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-7xl max-h-[90vh] overflow-hidden flex flex-col md:min-w-6xl h-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editMode ? 'Editar Producto' : 'Seleccionar Productos'}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? 'Modifica los detalles del producto'
              : 'Busca y selecciona productos para agregar a la venta'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div
              className={`${
                editMode ? 'hidden lg:flex' : ''
              } lg:col-span-2 flex flex-col`}
            >
              <div className="mb-4">
                <SearchInput
                  onChange={(value) => setSearchTerm(value)}
                  placeholder="Buscar productos por nombre o cod..."
                  value={searchTerm}
                />
              </div>

              <div className="flex-1 overflow-y-auto border rounded-lg p-2">
                <div className="space-y-2">
                  {!loading &&
                    productsWithUniqueIds.map((product) => {
                      const isAdded = isProductAdded(product.id)
                      const isSelected = selectedProduct?.id === product.id
                      const hasVariants =
                        product.has_variants &&
                        Array.isArray(product.variants) &&
                        product.variants.length > 0
                      const isExpanded =
                        hasVariants && expandedProducts.includes(product.id)
                      const isOutOfStock = (product.stock ?? 0) <= 0

                      return (
                        <div key={product.id} className="mb-2">
                          <div
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected && !hasVariants
                                ? 'border-blue-500 bg-blue-50'
                                : isAdded && !hasVariants
                                ? 'border-green-200 bg-green-50'
                                : isOutOfStock
                                ? 'border-gray-200 bg-gray-100 opacity-80'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (hasVariants) {
                                toggleProductExpansion(product.id)
                              } else if (!isAdded && !isOutOfStock) {
                                handleProductSelect(product)
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {product.brand?.name || ''}{' '}
                                  {product.description}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  {!hasVariants && (
                                    <>
                                      <span className="text-xs font-medium text-green-600">
                                        {currencySymbol}
                                        {product.price?.toFixed(2) || '0.00'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Stock:{' '}
                                        {product.stock !== undefined
                                          ? product.stock
                                          : 'N/A'}
                                        {isOutOfStock && (
                                          <Badge
                                            variant="destructive"
                                            className="ml-2 text-xs"
                                          >
                                            Agotado
                                          </Badge>
                                        )}
                                      </span>
                                    </>
                                  )}
                                  {hasVariants && (
                                    <span className="text-xs text-gray-500">
                                      {product.variants?.length || 0} variantes
                                      disponibles
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-3 flex items-center">
                                {hasVariants && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mr-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleProductExpansion(product.id)
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}

                                {isAdded && !hasVariants ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Agregado
                                  </Badge>
                                ) : (
                                  !hasVariants && (
                                    <Button
                                      variant={
                                        isSelected ? 'default' : 'outline'
                                      }
                                      size="sm"
                                      className="text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (!isAdded && !isOutOfStock)
                                          handleProductSelect(product)
                                      }}
                                      disabled={isOutOfStock}
                                    >
                                      {isSelected
                                        ? 'Seleccionado'
                                        : isOutOfStock
                                        ? 'Agotado'
                                        : 'Seleccionar'}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {hasVariants && isExpanded && (
                            <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-200">
                              {product.variants?.map((variant) => {
                                const variantTempId = `temp_${product.id}_${variant.id}`
                                const isVariantAdded =
                                  isProductAdded(variantTempId)
                                const isVariantSelected =
                                  selectedProduct?.id === variant.id
                                const isVariantOutOfStock =
                                  (variant.stock ?? 0) <= 0

                                return (
                                  <div
                                    key={variant.id}
                                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                      isVariantSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : isVariantAdded
                                        ? 'border-green-200 bg-green-50'
                                        : isVariantOutOfStock
                                        ? 'border-gray-200 bg-gray-100 opacity-80'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                    onClick={() =>
                                      !isVariantAdded &&
                                      !isVariantOutOfStock &&
                                      handleProductSelect(variant)
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h5 className="text-sm">
                                          {variant.name}
                                          {variant?.attributes &&
                                          variant?.attributes?.length > 0 ? (
                                            <span className="ml-2 text-xs text-gray-500">
                                              {variant.attributes
                                                .map(
                                                  (attr) =>
                                                    ` ${attr.attribute_value}`
                                                )
                                                .join(', ')}
                                            </span>
                                          ) : null}
                                        </h5>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="text-xs font-medium text-green-600">
                                            {currencySymbol}
                                            {variant.price?.toFixed(2) ||
                                              '0.00'}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            Stock:{' '}
                                            {variant.stock !== undefined
                                              ? variant.stock
                                              : 'N/A'}
                                            {isVariantOutOfStock && (
                                              <Badge
                                                variant="destructive"
                                                className="ml-2 text-xs"
                                              >
                                                Agotado
                                              </Badge>
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="ml-3">
                                        {isVariantAdded ? (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            Agregado
                                          </Badge>
                                        ) : (
                                          <Button
                                            variant={
                                              isVariantSelected
                                                ? 'default'
                                                : 'outline'
                                            }
                                            size="sm"
                                            className="text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              if (
                                                !isVariantAdded &&
                                                !isVariantOutOfStock
                                              ) {
                                                handleProductSelect(variant)
                                              }
                                            }}
                                            disabled={
                                              isVariantOutOfStock ||
                                              isVariantAdded
                                            }
                                          >
                                            {isVariantSelected
                                              ? 'Seleccionado'
                                              : isVariantAdded
                                              ? 'Agregado'
                                              : isVariantOutOfStock
                                              ? 'Agotado'
                                              : 'Seleccionar'}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  {loading && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50 animate-spin" />
                      <p>Cargando productos...</p>
                    </div>
                  )}

                  {!loading && products.data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No se encontraron productos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product selection and configuration area */}
            <div className="lg:col-span-1 pl-6 border-l">
              <ScrollArea className="h-full overflow-y-auto max-h-[calc(100vh-240px)]">
                {selectedProduct ? (
                  <div className="space-y-4 ">
                    <h3 className="font-semibold text-sm">
                      Configurar Producto
                    </h3>
                    <div className="p-4 bg-gray-50 border rounded-md">
                      <h4 className="font-bold text-sm">
                        {getFullProductName(selectedProduct)}
                      </h4>
                      <p className="text-xs text-green-600 mt-1">
                        Precio base: {currencySymbol}
                        {selectedProduct?.price?.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="modal-quantity" className="text-xs">
                          Cantidad
                        </Label>
                        <Input
                          id="modal-quantity"
                          type="number"
                          min="1"
                          max={selectedProduct?.stock}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.min(
                                Number.parseInt(e.target.value),
                                selectedProduct?.stock ?? 1
                              )
                            )
                          }
                        />
                        {selectedProduct?.stock !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedProduct.stock > 0
                              ? `Máximo disponible: ${selectedProduct.stock}`
                              : 'Sin stock disponible'}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label htmlFor="modal-price" className="text-xs">
                          Precio Unitario ({currencySymbol})
                        </Label>
                        <Input
                          id="modal-price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={unitPrice}
                          onChange={(e) =>
                            setUnitPrice(Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <Label htmlFor="modal-discount" className="text-xs">
                          Descuento ({currencySymbol})
                        </Label>
                        <Input
                          id="modal-discount"
                          type="number"
                          step="0.01"
                          min={0}
                          max={unitPrice * quantity}
                          value={discount}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value) || 0
                            setDiscount(
                              Math.max(0, Math.min(value, unitPrice * quantity))
                            )
                          }}
                        />
                      </div>
                      <div className="p-2 bg-blue-50 rounded-md text-xs">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>
                            {currencySymbol}
                            {(unitPrice * quantity).toFixed(2)}
                          </span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Descuento:</span>
                            <span>
                              -{currencySymbol}
                              {discount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                          <span>Total:</span>
                          <span>
                            {currencySymbol}
                            {(unitPrice * quantity - discount).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t">
                        <Button
                          onClick={handleAddOrUpdateProduct}
                          className="w-full"
                          size="lg"
                          disabled={unitPrice <= 0 || quantity <= 0}
                        >
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar a la Venta
                          </>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">Selecciona un producto</p>
                    <p className="text-sm">
                      Haz clic en un producto de la lista para configurarlo
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* End of product selection and configuration area */}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedProduct ? (
              <span>
                {editMode ? 'Editando' : 'Configurando'}:{' '}
                {getFullProductName(selectedProduct)}
                {editMode && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (Cantidad: {quantity}, Precio: {currencySymbol}
                    {unitPrice.toFixed(2)})
                  </span>
                )}
              </span>
            ) : (
              'Ningún producto seleccionado'
            )}
          </div>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
