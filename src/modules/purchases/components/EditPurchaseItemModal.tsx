'use client'
import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PurchaseItem } from '../schemas'
import { formatCurrencySoles } from '@/utils'

interface EditPurchaseItemModalProps {
    isOpen: boolean
    onClose: () => void
    item: PurchaseItem | null
    onUpdate: (updatedItem: PurchaseItem) => void
}

export default function EditPurchaseItemModal({
    isOpen,
    onClose,
    item,
    onUpdate
}: EditPurchaseItemModalProps) {
    const [price, setPrice] = useState(0)
    const [quantity, setQuantity] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [barCode, setBarCode] = useState('')

    useEffect(() => {
        if (item) {
            setPrice(item.price || 0)
            setQuantity(item.quantity || 0)
            setDiscount(item.discount || 0)
            setBarCode(item.bar_code || '')
        }
    }, [item, isOpen])

    const handleSave = () => {
        if (item) {
            onUpdate({
                ...item,
                price,
                quantity,
                discount,
                bar_code: barCode
            })
            onClose()
        }
    }

    if (!item) return null

    const total = (price * quantity) - discount

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.brand?.name} · {item.unit}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio Unitario</Label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="pl-7"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Cantidad</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discount">Descuento Total</Label>
                            <Input
                                id="discount"
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="text-destructive"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="barCode">Código de Barras</Label>
                            <Input
                                id="barCode"
                                value={barCode}
                                onChange={(e) => setBarCode(e.target.value)}
                                placeholder="Opcional"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center mt-2">
                        <span className="text-sm font-medium">Total Estimado</span>
                        <span className="text-lg font-bold text-primary">{formatCurrencySoles(total)}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
