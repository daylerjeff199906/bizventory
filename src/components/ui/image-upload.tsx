'use client'

import { ChangeEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Trash, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-toastify'

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    onRemove: (url: string) => void
    maxFiles?: number
    disabled?: boolean
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    value,
    onChange,
    onRemove,
    maxFiles = 5,
    disabled
}) => {
    const [isUploading, setIsUploading] = useState(false)

    const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        if (value.length + files.length > maxFiles) {
            toast.error(`Solo puedes subir un máximo de ${maxFiles} imágenes.`)
            return
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
            toast.success('Imágenes subidas correctamente')
        } catch (error) {
            console.error('Error uploading images:', error)
            toast.error('Error al subir imágenes')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div
                        key={url}
                        className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
                    >
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                disabled={disabled}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}
            </div>
            <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                            <ImagePlus className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-500">
                                {isUploading ? 'Subiendo...' : 'Subir imágenes'}
                            </span>
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={onUpload}
                            disabled={disabled || isUploading || value.length >= maxFiles}
                        />
                    </div>
                </label>
            </div>
        </div>
    )
}
