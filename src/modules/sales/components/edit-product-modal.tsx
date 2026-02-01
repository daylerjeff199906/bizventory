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
import { Separator } from '@/components/ui/separator'
import { Package, Settings, Tag, AlertCircle } from 'lucide-react'
import type { Currency } from '@/types'
import type { SaleItemValues } from '../schemas'

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateProduct: (updatedItem: SaleItemValues) => void
  product: SaleItemValues | null
  currency: Currency
}

export default function EditProductModal({
  isOpen,
  onClose,
  onUpdateProduct,
  product,
  currency
}: EditProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [basePrice, setBasePrice] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)

  const currencySymbol = currency === 'PEN' ? 'S/' : '$'

  // Inicializar valores cuando se abre el modal
  useEffect(() => {
    if (product && isOpen) {
      setQuantity(product.quantity || 1)
      setBasePrice(product.price_unit || 0)
      setDiscountAmount(product.discount || 0)
    }
  }, [product, isOpen])

  const maxDiscount = basePrice * quantity
  const subtotal = basePrice * quantity
  const finalPrice = subtotal - discountAmount

  const handleConfirm = () => {
    if (!product) return

    const updatedItem: SaleItemValues = {
      ...product,
      quantity,
      price_unit: basePrice,
      discount: discountAmount,
      subtotal: finalPrice
    }

    onUpdateProduct(updatedItem)
    onClose()
  }

  const isValidConfiguration = () => {
    return (
      quantity > 0 &&
      quantity <= (product?.stock || 0) &&
      discountAmount <= maxDiscount &&
      discountAmount >= 0 &&
      basePrice > 0
    )
  }

  const handleClose = () => {
    onClose()
    // Reset values when closing
    if (product) {
      setQuantity(product.quantity || 1)
      setBasePrice(product.price_unit || 0)
      setDiscountAmount(product.discount || 0)
    }
  }

  if (!product) return null

  const isOutOfStock = !product.stock || product.stock <= 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Editar Producto
          </DialogTitle>
          <DialogDescription>
            Modifica la cantidad, precio y descuento del producto seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {/* Información del producto */}
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-start gap-2 mb-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {product.brand?.name} {product.product_description}
                </h4>
                {product.variant_name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.variant_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.code}
              </Badge>
              {product.brand && (
                <Badge variant="outline" className="text-xs">
                  {product.brand.name}
                </Badge>
              )}
            </div>

            {product.attributes && product.attributes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.attributes.map((attr, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {attr.attribute_type}: {attr.attribute_value}
                  </Badge>
                ))}
              </div>
            )}

            <div className='flex items-center justify-between'>
              {/* stock */}
              <div className='flex items-center gap-1'>
                {
                  isOutOfStock ? (
                    <div className="flex text-sm items-center gap-1 text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      <span>Sin stock</span>
                    </div>
                  ) : (
                    <div className="flex text-sm items-center gap-1 text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>Stock disponible: {product.stock} {product.unit}</span>
                    </div>
                  )
                }
              </div>
              {/* Price */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Precio Unitario: {` `}
                  <span className='font-medium text-emerald-600 text-lg'>
                    {product.price_unit} {' '}
                  </span>
                  {currency}
                </p>
              </div>

            </div>
          </div>

          <Separator />

          {/* Campos de edición */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-quantity" className="text-sm">
                  Cantidad
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  max={product.stock || 0}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Number.parseInt(e.target.value) || 1)
                    )
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-discount" className="text-sm">
                  Descuento Total
                </Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max={maxDiscount}
                  step="0.01"
                  value={discountAmount}
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
                  Máximo: {currencySymbol}
                  {maxDiscount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumen de cálculos */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>
                {currencySymbol}
                {subtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Descuento:</span>
                <span>
                  -{currencySymbol}
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>
                {currencySymbol}
                {finalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidConfiguration()}
              className="flex-1"
            >
              Actualizar Producto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
