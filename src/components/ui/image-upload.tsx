'use client'

import { ChangeEvent, useState, useId } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import Image from 'next/image'
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
    const uniqueId = useId()

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Validación de cantidad
        if (value.length + files.length > maxFiles) {
            toast.error(`Máximo ${maxFiles} imágenes permitidas.`)
            e.target.value = ''
            return
        }

        // Validación de tamaño (5MB)
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

    const onFileRemove = async (url: string) => {
        try {
            setDeletingUrl(url)

            // 1. Eliminar del bucket
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

            // 2. Eliminar del estado (DB save requerirá submit del formulario)
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="group relative aspect-square rounded-xl overflow-hidden border bg-background"
                    >
                        <Image
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            alt="Product Image"
                            src={url}
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                                <ImagePlus className="h-8 w-8" />
                            )}
                            <span className="text-xs font-medium">
                                {isUploading ? 'Subiendo...' : 'Subir'}
                            </span>
                        </div>
                        <input
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
                <p className="text-xs text-muted-foreground">
                    Sube hasta {maxFiles} imágenes (máx. 5MB c/u)
                </p>
            )}
        </div>
    )
}
