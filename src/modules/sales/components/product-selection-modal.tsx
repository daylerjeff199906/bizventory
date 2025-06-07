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
import { Search, Package, Check, Plus, Save } from 'lucide-react'
import type { CombinedResultPrice } from '@/apis/app/productc.variants.list'
import type { Currency, SaleItemInput } from '@/types'
import { useProductsPrices } from '@/hooks/use-products-price'

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

  const currencySymbol = currency === 'PEN' ? 'S/' : '$'

  const { items: products, loading, fetchItems } = useProductsPrices()

  const productsWithUniqueIds = products.map((product) => ({
    ...product,
    temp_id: generateTempId()
  }))

  useEffect(() => {
    if (isOpen) {
      fetchItems(searchTerm)
    }
  }, [isOpen, searchTerm])

  // Efecto para cargar datos del producto en edición
  useEffect(() => {
    if (isOpen && editMode && editingProduct) {
      console.log('Cargando producto para edición:', editingProduct)

      // Encontrar el producto en la lista de productos
      const product = products.find((p) => p.id === editingProduct.product_id)

      if (product) {
        console.log('Producto encontrado:', product)
        setSelectedProduct(product)
        setQuantity(editingProduct.quantity)
        setUnitPrice(editingProduct.unit_price)
        setDiscount(editingProduct.discount_amount)
      } else {
        console.log('Producto no encontrado en la lista')
      }
    } else if (isOpen && !editMode) {
      // Resetear estado si no estamos en modo edición
      console.log('Reseteando estado para modo agregar')
      setSelectedProduct(null)
      setQuantity(1)
      setUnitPrice(0)
      setDiscount(0)
      setSearchTerm('')
    }
  }, [isOpen, editMode, editingProduct, products])

  // Efecto para resetear cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedProduct(null)
      setQuantity(1)
      setUnitPrice(0)
      setDiscount(0)
      setSearchTerm('')
    }
  }, [isOpen])

  const handleProductSelect = (product: CombinedResultPrice) => {
    setSelectedProduct(product)
    setUnitPrice(Number(product.price) || 0)
    if (!editMode) {
      setQuantity(1)
      setDiscount(0)
    }
  }

  // Función para generar ID temporal único
  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const handleAddOrUpdateProduct = () => {
    if (!selectedProduct) return

    const totalPrice = unitPrice * quantity - discount

    const productItem: SaleItemInput = {
      temp_id: editMode && editingTempId ? editingTempId : generateTempId(),
      product_id: selectedProduct.id,
      product_name: `${selectedProduct.brand?.name || ''} ${
        selectedProduct.description || ''
      }${
        selectedProduct.variant_name ? ` ${selectedProduct.variant_name}` : ''
      } ${
        selectedProduct.attributes && selectedProduct.attributes.length > 0
          ? `${selectedProduct.attributes
              .map((attr) => attr.attribute_value)
              .join(', ')}`
          : ''
      }`,
      quantity,
      unit_price: unitPrice,
      discount_amount: discount,
      total_price: totalPrice
    }

    console.log('Guardando producto:', productItem)

    if (editMode && onUpdateProduct && editingTempId) {
      console.log('Actualizando producto con temp_id:', editingTempId)
      onUpdateProduct(editingTempId, productItem)
    } else {
      console.log('Agregando nuevo producto')
      onAddProduct(productItem)
    }

    // Cerrar modal después de agregar/actualizar
    onClose()
  }

  const isProductAdded = (productId: string) => {
    // En modo edición, no considerar el producto actual como ya agregado
    if (editMode && editingProduct && editingProduct.product_id === productId) {
      return false
    }
    return addedProductIds.includes(productId)
  }

  const handleClose = () => {
    onClose()
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
            {/* Lista de productos - oculta en modo edición en pantallas pequeñas */}
            <div
              className={`${
                editMode ? 'hidden lg:flex' : ''
              } lg:col-span-2 flex flex-col`}
            >
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border rounded-lg p-2">
                <div className="space-y-2">
                  {!loading &&
                    productsWithUniqueIds.map((product) => {
                      const isAdded = isProductAdded(product.temp_id)
                      const isSelected = selectedProduct?.id === product.id

                      const hasVariants = product.variant_id !== undefined
                      return (
                        <div
                          key={product.temp_id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isAdded
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() =>
                            !isAdded && handleProductSelect(product)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {product.brand?.name || ''}
                                {product.description}
                                {hasVariants && product.variant_name
                                  ? ` - ${product.variant_name}`
                                  : ''}
                                {hasVariants &&
                                product?.attributes &&
                                product?.attributes?.length > 0
                                  ? ` ${product?.attributes
                                      ?.map((attr) => `${attr.attribute_value}`)
                                      .join(', ')}`
                                  : ''}
                              </h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-medium text-green-600">
                                  {currencySymbol}
                                  {(product && product?.price?.toFixed(2)) ||
                                    '0.00'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              {isAdded ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Agregado
                                </Badge>
                              ) : (
                                <Button
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs"
                                >
                                  {isSelected ? 'Seleccionado' : 'Seleccionar'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  {loading && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50 animate-spin" />
                      <p>Cargando productos...</p>
                    </div>
                  )}

                  {!loading && products.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No se encontraron productos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panel de configuración del producto */}
            <div
              className={`${editMode ? 'lg:col-span-3' : 'lg:col-span-1'} ${
                editMode ? '' : 'border-l'
              } pl-6`}
            >
              {selectedProduct ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {editMode ? 'Editar Producto' : 'Configurar Producto'}
                  </h3>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">{selectedProduct.name}</h4>
                    <p className="text-sm text-green-600 mt-1">
                      Precio base: {currencySymbol}
                      {selectedProduct?.price?.toFixed(2)}
                    </p>
                    {editMode && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Modo Edición</Badge>
                        {editingTempId && (
                          <Badge variant="secondary" className="text-xs">
                            ID: {editingTempId.slice(-8)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="modal-quantity">Cantidad</Label>
                      <Input
                        id="modal-quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number.parseInt(e.target.value) || 1)
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="modal-price">
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

                    <div>
                      <Label htmlFor="modal-discount">
                        Descuento ({currencySymbol})
                      </Label>
                      <Input
                        id="modal-discount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={unitPrice * quantity}
                        value={discount}
                        onChange={(e) =>
                          setDiscount(Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>
                          {currencySymbol}
                          {(unitPrice * quantity).toFixed(2)}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento:</span>
                          <span>
                            -{currencySymbol}
                            {discount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>
                          {currencySymbol}
                          {(unitPrice * quantity - discount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddOrUpdateProduct}
                      className="w-full"
                      size="lg"
                      disabled={unitPrice <= 0 || quantity <= 0}
                    >
                      {editMode ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar a la Venta
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">
                    {editMode
                      ? 'Cargando producto...'
                      : 'Selecciona un producto'}
                  </p>
                  <p className="text-sm">
                    {editMode
                      ? 'Espera mientras cargamos la información'
                      : 'Haz clic en un producto de la lista para configurarlo'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedProduct ? (
              <span>
                {editMode ? 'Editando' : 'Configurando'}: {selectedProduct.name}
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
