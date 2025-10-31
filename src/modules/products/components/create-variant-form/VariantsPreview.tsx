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
  field: 'name' | 'attribute' | 'new-attribute'
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
    field: 'name' | 'attribute' | 'new-attribute',
    attributeIndex?: number
  ) => {
    const variant = localVariants[variantIndex]
    let currentValue = ''

    if (field === 'name') {
      currentValue = variant.name || `Variante ${variantIndex + 1}`
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
        <div className="space-y-3">
          {localVariants.map((variant, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 transition-all duration-200 group"
            >
              {/* Header de la variante */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {editing.variantIndex === index &&
                    editing.field === 'name' ? (
                      <div className="flex items-center gap-1">
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
                          size="sm"
                          onClick={saveEdit}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                          {productName.toUpperCase()}{' '}
                          {(
                            variant.name || `VARIANTE ${index + 1}`
                          ).toUpperCase()}
                        </h4>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {hasChanges && (
                    <Badge variant="secondary" className="text-xs mr-2">
                      Modificado
                    </Badge>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!(
                      editing.variantIndex === index && editing.field === 'name'
                    ) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(index, 'name')}
                        className="h-7 w-7 p-0 hover:bg-gray-100 cursor-pointer"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setDeleteState({ type: 'variant', variantIndex: index })
                      }
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Atributos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-700">
                    Atributos:
                  </p>
                  {editing.variantIndex !== index && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(index, 'new-attribute')}
                      className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                  )}
                </div>

                {/* Lista de atributos existentes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-2 mb-2">
                  {variant.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="relative group/attr">
                      <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                        <span className="text-xs font-semibold text-gray-500">
                          {attrIndex + 1}.
                        </span>
                        <div className="flex flex-row gap-1.5 items-center flex-1">
                          <span className="text-xs font-medium text-gray-700">
                            {ATTRIBUTE_TYPES[
                              attr.attribute_type as AttributeType
                            ] || attr.attribute_type}
                            :
                          </span>

                          {editing.variantIndex === index &&
                          editing.field === 'attribute' &&
                          editing.attributeIndex === attrIndex ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-6 text-xs flex-1"
                              placeholder="Valor del atributo"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit()
                                if (e.key === 'Escape') cancelEdit()
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-900 flex-1">
                              {attr.attribute_value || '-'}
                            </span>
                          )}
                        </div>

                        {/* Botones de acción para atributos */}
                        <div className="flex gap-1 opacity-0 group-hover/attr:opacity-100 transition-opacity">
                          {editing.variantIndex === index &&
                          editing.field === 'attribute' &&
                          editing.attributeIndex === attrIndex ? (
                            <>
                              <Button
                                size="sm"
                                onClick={saveEdit}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-2 w-2" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startEdit(index, 'attribute', attrIndex)
                                }
                                className="h-6 w-6 p-0 cursor-pointer"
                              >
                                <Edit className="h-2 w-2" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setDeleteState({
                                    type: 'attribute',
                                    variantIndex: index,
                                    attributeIndex: attrIndex
                                  })
                                }
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="h-2 w-2" />
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
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Agregar nuevo atributo:
                      </p>
                      <div className="flex gap-2">
                        <Select
                          value={newAttributeType}
                          onValueChange={setNewAttributeType}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Tipo de atributo" />
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
                        <Input
                          value={newAttributeValue}
                          onChange={(e) => setNewAttributeValue(e.target.value)}
                          className="flex-1"
                          placeholder="Valor del atributo"
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
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={
                            !newAttributeType || !newAttributeValue.trim()
                          }
                          className="h-10"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                {variant.attributes.length === 0 &&
                  editing.variantIndex !== index && (
                    <p className="text-xs text-gray-500 italic py-2">
                      Sin atributos definidos
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading &&
        [1, 2, 3].map((loader) => (
          <div
            key={loader}
            className="animate-pulse bg-gray-200 h-20 rounded-lg mb-3"
          ></div>
        ))}

      {hasChanges && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">
                Tienes cambios sin guardar
              </span>
            </div>
            <div className="text-xs text-blue-600">
              {`Los cambios se aplicarán cuando hagas clic en "Guardar cambios"`}
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
                ? `¿Estás seguro de que quieres eliminar la variante "${
                    localVariants[deleteState.variantIndex]?.name ||
                    `Variante ${deleteState.variantIndex + 1}`
                  }"?`
                : deleteState?.attributeIndex !== undefined
                ? `¿Estás seguro de que quieres eliminar el atributo "${
                    localVariants[deleteState.variantIndex]?.attributes[
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
