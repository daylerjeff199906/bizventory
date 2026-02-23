'use client'

import { ChangeEvent, useState, useId, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'react-toastify'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    onRemove: (url: string) => void
    maxFiles?: number
    disabled?: boolean
    className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onRemove,
    maxFiles = 5,
    disabled,
    className
}) => {
    const [isUploading, setIsUploading] = useState(false)
    const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const uniqueId = useId()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        setDragOverIndex(index)
    }

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const newOrder = [...value]
            const [removed] = newOrder.splice(draggedIndex, 1)
            newOrder.splice(dragOverIndex, 0, removed)
            onChange(newOrder)
        }
        setDraggedIndex(null)
        setDragOverIndex(null)
    }

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (value.length + files.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} imágenes permitidas.`)
            e.target.value = ''
            return
        }

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > 5 * 1024 * 1024) {
                toast.error(`El archivo ${files[i].name} excede el límite de 5MB.`)
                e.target.value = ''
                return
            }
        }

        setIsUploading(true)

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('folder', 'products')

                const response = await fetch('/api/r2/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('Error subiendo imagen')
                }

                const data = await response.json()
                return data.url
            })

            const newUrls = await Promise.all(uploadPromises)
            onChange([...value, ...newUrls])
            toast.success('Imágenes actualizadas')
        } catch (error) {
            console.error('Error uploading images:', error)
            toast.error('Error al subir imágenes')
        } finally {
            setIsUploading(false)
            e.target.value = ''
        }
    }

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        if (!files || files.length === 0) return

        if (value.length + files.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} imágenes permitidas.`)
            return
        }

        for (let i = 0; i < files.length; i++) {
            if (files[i].size > 5 * 1024 * 1024) {
                toast.error(`El archivo ${files[i].name} excede el límite de 5MB.`)
                return
            }
        }

        setIsUploading(true)

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('folder', 'products')

                const response = await fetch('/api/r2/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('Error subiendo imagen')
                }

                const data = await response.json()
                return data.url
            })

            const newUrls = await Promise.all(uploadPromises)
            onChange([...value, ...newUrls])
            toast.success('Imágenes actualizadas')
        } catch (error) {
            console.error('Error uploading images:', error)
            toast.error('Error al subir imágenes')
        } finally {
            setIsUploading(false)
        }
    }, [value, maxFiles, onChange])

    const onFileRemove = async (url: string) => {
        try {
            setDeletingUrl(url)

            const response = await fetch('/api/r2/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            })

            if (!response.ok) {
                console.warn('No se pudo eliminar del bucket, pero se quitará de la lista')
            }

            onRemove(url)
            toast.success('Imagen eliminada')
        } catch (error) {
            console.error('Error removing image:', error)
            toast.error('Error al eliminar la imagen')
        } finally {
            setDeletingUrl(null)
        }
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {value.map((url, index) => (
                    <div
                        key={url}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                            "group relative aspect-square rounded-xl overflow-hidden border bg-background cursor-move transition-all",
                            draggedIndex === index && "opacity-50 scale-95",
                            dragOverIndex === index && "ring-2 ring-primary ring-offset-2"
                        )}
                    >
                        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 rounded-md p-1">
                                <GripVertical className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        
                        <img
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            alt="Product Image"
                            src={url}
                            draggable={false}
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                onClick={() => onFileRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-9 w-9 rounded-full"
                                disabled={disabled || deletingUrl === url}
                            >
                                {deletingUrl === url ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        
                        {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                Principal
                            </div>
                        )}
                    </div>
                ))}

                {value.length < maxFiles && (
                    <label
                        htmlFor={uniqueId}
                        className={cn(
                            "relative aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer",
                            (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <>
                                    <ImagePlus className="h-8 w-8" />
                                    <span className="text-xs font-medium">
                                        {isUploading ? 'Subiendo...' : 'Subir'}
                                    </span>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            id={uniqueId}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={onUpload}
                            disabled={disabled || isUploading}
                        />
                    </label>
                )}
            </div>
            {value.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    Arrastra imágenes aquí o haz clic para subir (máx. {maxFiles})
                </p>
            )}
            {value.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    Arrastra las imágenes para reordernar. La primera será la principal.
                </p>
            )}
        </div>
    )
}
