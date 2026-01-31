'use client'

import { useState } from 'react'
import { Check, X, Save, Plus, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ATTRIBUTE_TYPES,
  type AttributeType,
  type ProductVariantsData
} from '../../schemas'

interface VariantsPreviewProps {
  variants: ProductVariantsData
  productName: string
  productCode: string
  onVariantsUpdate?: (updatedVariants: ProductVariantsData) => void
  isLoading?: boolean
}

interface EditingState {
  variantIndex: number | null
  field: 'name' | 'price' | 'attribute' | 'new-attribute'
  attributeIndex?: number
}

interface DeleteState {
  type: 'variant' | 'attribute'
  variantIndex: number
  attributeIndex?: number
}

export const VariantsPreview = ({
  variants,
  productName,
  onVariantsUpdate,
  isLoading
}: VariantsPreviewProps) => {
  const [localVariants, setLocalVariants] =
    useState<ProductVariantsData>(variants)
  const [editing, setEditing] = useState<EditingState>({
    variantIndex: null,
    field: 'name'
  })
  const [editValue, setEditValue] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null)
  const [newAttributeType, setNewAttributeType] = useState('')
  const [newAttributeValue, setNewAttributeValue] = useState('')

  if (variants.length === 0) return null

  const startEdit = (
    variantIndex: number,
    field: 'name' | 'price' | 'attribute' | 'new-attribute',
    attributeIndex?: number
  ) => {
    const variant = localVariants[variantIndex]
    let currentValue = ''

    if (field === 'name') {
      currentValue = variant.name || `Variante ${variantIndex + 1}`
    } else if (field === 'price') {
      currentValue = (variant.price || 0).toString()
    } else if (field === 'attribute' && attributeIndex !== undefined) {
      currentValue = variant.attributes[attributeIndex]?.attribute_value || ''
    }

    setEditValue(currentValue)
    setEditing({ variantIndex, field, attributeIndex })
  }

  const cancelEdit = () => {
    setEditing({ variantIndex: null, field: 'name' })
    setEditValue('')
    setNewAttributeType('')
    setNewAttributeValue('')
  }

  const saveEdit = () => {
    if (editing.variantIndex === null) return

    const updatedVariants = [...localVariants]
    const variant = updatedVariants[editing.variantIndex]

    if (editing.field === 'name') {
      variant.name = editValue.trim() || `Variante ${editing.variantIndex + 1}`
    } else if (editing.field === 'price') {
      variant.price = parseFloat(editValue) || 0
    } else if (
      editing.field === 'attribute' &&
      editing.attributeIndex !== undefined
    ) {
      variant.attributes[editing.attributeIndex].attribute_value =
        editValue.trim()
    } else if (
      editing.field === 'new-attribute' &&
      newAttributeType &&
      newAttributeValue.trim()
    ) {
      variant.attributes.push({
        attribute_type: newAttributeType,
        attribute_value: newAttributeValue.trim()
      })
    }

    setLocalVariants(updatedVariants)
    setHasChanges(true)
    cancelEdit()
  }

  const deleteAttribute = (variantIndex: number, attributeIndex: number) => {
    const updatedVariants = [...localVariants]
    updatedVariants[variantIndex].attributes.splice(attributeIndex, 1)
    setLocalVariants(updatedVariants)
    setHasChanges(true)
    setDeleteState(null)
  }

  const deleteVariant = (variantIndex: number) => {
    const updatedVariants = localVariants.filter(
      (_, index) => index !== variantIndex
    )
    setLocalVariants(updatedVariants)
    setHasChanges(true)
    setDeleteState(null)
  }

  const handleSaveAll = async () => {
    if (onVariantsUpdate) {
      onVariantsUpdate(localVariants)
    }
    setHasChanges(false)
  }

  const handleDiscardChanges = () => {
    setLocalVariants(variants)
    setHasChanges(false)
    cancelEdit()
  }

  const getAvailableAttributeTypes = (variantIndex: number) => {
    const variant = localVariants[variantIndex]
    const usedTypes = variant.attributes.map((attr) => attr.attribute_type)
    return Object.entries(ATTRIBUTE_TYPES).filter(
      ([key]) => !usedTypes.includes(key)
    )
  }

  return (
    <div className="mt-6  mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Previsualización de variantes</h3>
        {hasChanges && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDiscardChanges}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Descartar
            </Button>
            <Button size="sm" onClick={handleSaveAll} className="h-7 text-xs">
              <Save className="h-3 w-3 mr-1" />
              Guardar cambios
            </Button>
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="space-y-4">
          {localVariants.map((variant, index) => (
            <Card
              key={index}
              className="transition-all duration-200 group hover:border-primary/50 overflow-hidden"
            >
              {/* Header de la variante */}
              <div className="flex items-start justify-between p-4 pb-2 border-b bg-muted/20">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="bg-background">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    {editing.variantIndex === index &&
                      editing.field === 'name' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 text-sm font-medium"
                          placeholder={`${productName} Variante ${index + 1}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <Button
                          size="icon"
                          className="h-8 w-8"
                          onClick={saveEdit}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <h4 className="text-sm font-semibold leading-tight">
                          {productName} - {(
                            variant.name || `VARIANTE ${index + 1}`
                          )}
                        </h4>
                        {!(
                          editing.variantIndex === index && editing.field === 'name'
                        ) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEdit(index, 'name')}
                              className="h-6 w-6 opacity-0 group-hover/title:opacity-100 transition-opacity"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                      </div>
                    )}

                    {/* Price section */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Precio:</span>
                      {editing.variantIndex === index &&
                        editing.field === 'price' ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-7 w-24 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                          <Button
                            size="icon"
                            className="h-7 w-7"
                            onClick={saveEdit}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-7 w-7"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group/price">
                          <span className="text-sm font-medium">S/ {(variant.price || 0).toFixed(2)}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(index, 'price')}
                            className="h-5 w-5 opacity-0 group-hover/price:opacity-100 transition-opacity"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <Badge variant="secondary" className="text-xs">
                      Modificado
                    </Badge>
                  )}
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setDeleteState({ type: 'variant', variantIndex: index })
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Atributos */}
              <CardContent className="p-4 pt-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Atributos
                  </p>
                  {editing.variantIndex !== index && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(index, 'new-attribute')}
                      className="h-7 text-xs hover:bg-muted"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  )}
                </div>

                {/* Lista de atributos existentes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
                  {variant.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="relative group/attr bg-muted/30 rounded-md border border-transparent hover:border-border transition-colors">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-xs font-mono text-muted-foreground/60 w-5">
                          {String(attrIndex + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-row gap-2 items-center flex-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                            {ATTRIBUTE_TYPES[
                              attr.attribute_type as AttributeType
                            ] || attr.attribute_type}
                          </span>

                          <span className="text-muted-foreground/40">·</span>

                          {editing.variantIndex === index &&
                            editing.field === 'attribute' &&
                            editing.attributeIndex === attrIndex ? (
                            <div className="flex items-center gap-1 flex-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-6 text-xs px-1 bg-background"
                                placeholder="Valor"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit()
                                  if (e.key === 'Escape') cancelEdit()
                                }}
                              />
                              <Button
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={saveEdit}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 shrink-0"
                                onClick={cancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm font-medium truncate flex-1 block" title={attr.attribute_value}>
                              {attr.attribute_value || '-'}
                            </span>
                          )}
                        </div>

                        {/* Botones de acción para atributos */}
                        <div className="flex gap-1 opacity-0 group-hover/attr:opacity-100 transition-opacity ml-auto">
                          {!(editing.variantIndex === index &&
                            editing.field === 'attribute' &&
                            editing.attributeIndex === attrIndex) && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    startEdit(index, 'attribute', attrIndex)
                                  }
                                  className="h-6 w-6"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    setDeleteState({
                                      type: 'attribute',
                                      variantIndex: index,
                                      attributeIndex: attrIndex
                                    })
                                  }
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulario para agregar nuevo atributo */}
                {editing.variantIndex === index &&
                  editing.field === 'new-attribute' && (
                    <div className="border border-dashed border-primary/40 rounded-lg p-4 bg-primary/5 mt-3">
                      <p className="text-xs font-semibold text-primary mb-3">
                        Nuevo atributo
                      </p>
                      <div className="flex gap-2 items-end">
                        <div className="grid gap-1.5 flex-1">
                          <label className="text-xs text-muted-foreground">Tipo</label>
                          <Select
                            value={newAttributeType}
                            onValueChange={setNewAttributeType}
                          >
                            <SelectTrigger className="h-9 bg-background">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableAttributeTypes(index).map(
                                ([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5 flex-1">
                          <label className="text-xs text-muted-foreground">Valor</label>
                          <Input
                            value={newAttributeValue}
                            onChange={(e) => setNewAttributeValue(e.target.value)}
                            className="h-9 bg-background"
                            placeholder="Ej. Rojo, XL, etc."
                            onKeyDown={(e) => {
                              if (
                                e.key === 'Enter' &&
                                newAttributeType &&
                                newAttributeValue.trim()
                              )
                                saveEdit()
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                        </div>
                        <div className="flex gap-1 pb-0.5">
                          <Button
                            size="icon"
                            onClick={saveEdit}
                            disabled={!newAttributeType || !newAttributeValue.trim()}
                            className="h-9 w-9"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={cancelEdit}
                            className="h-9 w-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                {variant.attributes.length === 0 &&
                  editing.variantIndex !== index && (
                    <div className="text-center py-6 bg-muted/10 rounded-lg border border-dashed">
                      <p className="text-xs text-muted-foreground mb-2">
                        No hay atributos definidos para esta variante
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(index, 'new-attribute')}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Agregar primer atributo
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading &&
        [1, 2, 3].map((loader) => (
          <div
            key={loader}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg mb-3"
          ></div>
        ))}

      {hasChanges && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg shadow-sm dark:bg-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 "></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
              <div>
                <span className="text-sm text-primary font-medium block">
                  Tienes cambios sin guardar
                </span>
                <span className="text-xs text-muted-foreground">
                  Los cambios se aplicarán al hacer clic en "Guardar cambios"
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDiscardChanges}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Descartar
              </Button>
              <Button size="sm" onClick={handleSaveAll} className="text-xs">
                <Save className="h-3 w-3 mr-1" />
                Guardar todo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={!!deleteState}
        onOpenChange={() => setDeleteState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteState?.type === 'variant'
                ? 'Eliminar variante'
                : 'Eliminar atributo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteState?.type === 'variant'
                ? `¿Estás seguro de que quieres eliminar la variante "${localVariants[deleteState.variantIndex]?.name ||
                `Variante ${deleteState.variantIndex + 1}`
                }"?`
                : deleteState?.attributeIndex !== undefined
                  ? `¿Estás seguro de que quieres eliminar el atributo "${localVariants[deleteState.variantIndex]?.attributes[
                    deleteState.attributeIndex
                  ]?.attribute_type
                  }"?`
                  : ''}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteState?.type === 'variant') {
                  deleteVariant(deleteState.variantIndex)
                } else if (
                  deleteState?.type === 'attribute' &&
                  deleteState.attributeIndex !== undefined
                ) {
                  deleteAttribute(
                    deleteState.variantIndex,
                    deleteState.attributeIndex
                  )
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
