'use client'

import type React from 'react'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X, RefreshCw, Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

import { productSchema, type CreateProductData } from '@/modules/products'
import { generateProductCode } from './generate-code'
import { APP_URLS } from '@/config/app-urls'

export const NewProductForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  //   const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const [tagInput, setTagInput] = useState('')
  const router = useRouter()

  const form = useForm<CreateProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      code: '',
      tags: []
      //   images: []
    }
  })

  const generateCode = () => {
    const newCode = generateProductCode()
    form.setValue('code', newCode)
  }

  //   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const files = event.target.files
  //     if (files) {
  //       const newImages = Array.from(files).map((file) =>
  //         URL.createObjectURL(file)
  //       )
  //       setUploadedImages((prev) => [...prev, ...newImages])
  //       form.setValue('images', [...uploadedImages, ...newImages])
  //     }
  //   }

  //   const removeImage = (index: number) => {
  //     const newImages = uploadedImages.filter((_, i) => i !== index)
  //     setUploadedImages(newImages)
  //     form.setValue('images', newImages)
  //   }

  const addTag = () => {
    if (tagInput.trim() && !form.getValues('tags')?.includes(tagInput.trim())) {
      const currentTags = form.getValues('tags') || []
      const newTags = [...currentTags, tagInput.trim()]
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    const newTags = currentTags.filter((tag) => tag !== tagToRemove)
    form.setValue('tags', newTags)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const onSubmit = async (data: CreateProductData) => {
    setIsLoading(true)
    try {
      const productData = {
        ...data
      }
      console.log('Datos del producto a crear:', productData)

      //   await productApi.create(productData)

      router.push('/products')
    } catch (error) {
      console.error('Error al crear el producto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a productos
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Registrar nuevo producto
            </h1>
            <p className="text-gray-600 mt-1">
              Completa la información básica del producto
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-12"
          >
            {/* Información básica */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Información básica
                </h2>
                <p className="text-gray-600 mt-1">
                  Datos principales del producto
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Nombre del producto *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Pulsera de ojos turcos color azul"
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Descripción *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las características principales del producto..."
                          rows={4}
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Una buena descripción ayuda a los clientes a entender
                        mejor el producto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Información adicional */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Información adicional
                </h2>
                <p className="text-gray-600 mt-1">
                  Datos opcionales para mejor organización
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Marca
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Nike, Adidas, etc."
                          className="text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Código del producto
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="PRD-2025-0001"
                            className="text-base"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateCode}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generar
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Código único para identificación interna. Se genera
                        automáticamente si no se especifica.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Etiquetas
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar etiqueta..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            className="text-base"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addTag}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-sm"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Las etiquetas ayudan a categorizar y buscar productos más
                      fácilmente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <Link href={APP_URLS.PRODUCTS.LIST}>
                <Button type="button" variant="outline" size="lg">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creando producto...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear producto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
