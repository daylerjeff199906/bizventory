'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { BusinessForm, businessSchema, generateSlug } from '@/schemas/business/register.busines'
import { updateBusiness, getCategoriesByBusiness } from '@/apis/app/business'
import { toast } from 'react-toastify'
import { businessTypes } from '@/schemas/business/register.busines'
import { ImageUpload } from '@/components/ui/image-upload'

interface SettingsFormProps {
    initialData: BusinessForm
    businessId: string
}

interface Category {
    id: string
    name: string
}

export function SettingsForm({ initialData, businessId }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)

    const fetchCategories = useCallback(async () => {
        setIsLoadingCategories(true)
        try {
            const cats = await getCategoriesByBusiness(businessId)
            setCategories(cats)
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setIsLoadingCategories(false)
        }
    }, [businessId])

    useEffect(() => {
        fetchCategories()
        if (initialData.categories && Array.isArray(initialData.categories)) {
            setSelectedCategories(initialData.categories)
        }
    }, [fetchCategories, initialData.categories])

    const form = useForm<BusinessForm>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            ...initialData,
            description: initialData.description || '',
            document_number: initialData.document_number || '',
            brand: initialData.brand || '',
            acronym: initialData.acronym || '',
            cover_image_url: initialData.cover_image_url || '',
            map_iframe_url: initialData.map_iframe_url || '',
            contact_phone: initialData.contact_phone || '',
            address: initialData.address || '',
            slug: initialData.slug || '',
            is_public: initialData.is_public ?? false,
            categories: initialData.categories || [],
        }
    })

    const watchedBusinessName = form.watch('business_name')
    const watchedSlug = form.watch('slug')

    useEffect(() => {
        if (watchedBusinessName && !watchedSlug) {
            form.setValue('slug', generateSlug(watchedBusinessName))
        }
    }, [watchedBusinessName, watchedSlug, form])

    const onSubmit = async (data: BusinessForm) => {
        setIsLoading(true)
        try {
            // Ensure slug is generated from business_name if empty
            const slugToSend = data.slug || generateSlug(data.business_name || '')
            
            await updateBusiness(businessId, {
                ...data,
                slug: slugToSend
            })
            toast.success('Configuración actualizada correctamente')
        } catch (error) {
            console.error(error)
            toast.error('Error al actualizar la configuración')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
                {/* Perfil Público */}
                <div className="bg-muted/30 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-2">Perfil Público</h2>
                    <p className="text-muted-foreground mb-6">
                        Activa el perfil público para que tu negocio sea visible como una tienda virtual.
                    </p>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="is_public"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Activar Tienda Virtual</FormLabel>
                                        <FormDescription>
                                            Tu negocio será visible públicamente con sus productos
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? false}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL del Perfil</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-nowrap">/store/</span>
                                                <Input
                                                    className="w-full"
                                                    placeholder="mi-negocio"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(generateSlug(e.target.value))}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newSlug = generateSlug(initialData.business_name || form.getValues('business_name') || '')
                                                        field.onChange(newSlug)
                                                    }}
                                                    title="Regenerar desde el nombre"
                                                >
                                                    ↻
                                                </Button>
                                            </div>
                                            {field.value && (
                                                <p className="text-xs text-muted-foreground">
                                                    Tu tienda será visible en: <span className="text-primary font-medium">/store/{field.value}</span>
                                                </p>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Se generará automáticamente si está vacío. Evita duplicados automáticamente.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Logo y Marca - Estilo Facebook */}
                <div className="bg-muted/30 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-2">Logo y Marca</h2>
                    <p className="text-muted-foreground mb-6">
                        La imagen de portada se mostrará en el encabezado de tu perfil público.
                    </p>

                    <div className="space-y-4">
                        {/* Cover Image estilo Facebook */}
                        <FormField
                            control={form.control}
                            name="cover_image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagen de Portada</FormLabel>
                                    <FormControl>
                                        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-muted">
                                            {field.value ? (
                                                <img
                                                    src={field.value}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <span>Sin imagen de portada</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <ImageUpload
                                                    value={field.value ? [field.value] : []}
                                                    onChange={(urls: string[]) => field.onChange(urls[0] || '')}
                                                    onRemove={() => field.onChange('')}
                                                    maxFiles={1}
                                                />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Logo con superposición estilo Facebook */}
                        <div className="relative -mt-16 md:-mt-20 px-4">
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg">
                                                {field.value ? (
                                                    <img
                                                        src={field.value}
                                                        alt="Logo"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                                        <span className="text-xs text-center">Sin logo</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                                    <ImageUpload
                                                        value={field.value ? [field.value] : []}
                                                        onChange={(urls: string[]) => field.onChange(urls[0] || '')}
                                                        onRemove={() => field.onChange('')}
                                                        maxFiles={1}
                                                    />
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Información del Negocio - Sección Básica */}
                <div className="bg-muted/30 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-2">Información Básica</h2>
                    <p className="text-muted-foreground mb-6">
                        Datos fundamentales de tu negocio.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="business_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Negocio</FormLabel>
                                    <FormControl>
                                        <Input className="w-full" placeholder="Mi Empresa S.A.C." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="business_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Negocio</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {businessTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="document_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RUC / Documento</FormLabel>
                                    <FormControl>
                                        <Input className="w-full" placeholder="20123456789" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="business_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email de Contacto</FormLabel>
                                    <FormControl>
                                        <Input className="w-full" type="email" placeholder="contacto@empresa.com" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input className="w-full" placeholder="+51 987 654 321" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="acronym"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Acrónimo / Siglas</FormLabel>
                                    <FormControl>
                                        <Input className="w-full" placeholder="EMP" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormDescription>
                                        Usado para códigos internos
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Categorías */}
                <div className="bg-muted/30 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-2">Categorías</h2>
                    <p className="text-muted-foreground mb-6">
                        Selecciona las categorías que representan a tu negocio.
                    </p>

                    <FormField
                        control={form.control}
                        name="categories"
                        render={() => (
                            <FormItem>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className={`
                                                flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
                                                ${selectedCategories.includes(category.id)
                                                    ? 'border-primary bg-primary/10'
                                                    : 'hover:border-primary/50 hover:bg-muted/50'}
                                            `}
                                            onClick={() => {
                                                const newCategories = selectedCategories.includes(category.id)
                                                    ? selectedCategories.filter(id => id !== category.id)
                                                    : [...selectedCategories, category.id]
                                                setSelectedCategories(newCategories)
                                                form.setValue('categories', newCategories)
                                            }}
                                        >
                                            <div className={`
                                                w-4 h-4 rounded border flex items-center justify-center
                                                ${selectedCategories.includes(category.id)
                                                    ? 'bg-primary border-primary'
                                                    : 'border-muted-foreground'}
                                            `}>
                                                {selectedCategories.includes(category.id) && (
                                                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm">{category.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {isLoadingCategories ? (
                                    <p className="text-sm text-muted-foreground mt-4">
                                        Cargando categorías...
                                    </p>
                                ) : categories.length === 0 ? (
                                    <p className="text-sm text-muted-foreground mt-4">
                                        No hay categorías disponibles. Crea categorías en la sección de productos.
                                    </p>
                                ) : null}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Ubicación */}
                <div className="bg-muted/30 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-2">Ubicación</h2>
                    <p className="text-muted-foreground mb-6">
                        Información de ubicación de tu negocio.
                    </p>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección</FormLabel>
                                    <FormControl>
                                        <Input className="w-full" placeholder="Av. Principal 123, Lima" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="map_iframe_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Embed de Mapa (Google Maps)</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="w-full"
                                            placeholder="<iframe src='...'"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Pega el código embed de Google Maps para mostrar la ubicación
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Descripción */}
                <div className="bg-muted/30 rounded-lg p-6 border">
                    <h2 className="text-lg font-semibold mb-2">Descripción</h2>
                    <p className="text-muted-foreground mb-6">
                        Cuéntanos más sobre tu negocio.
                    </p>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Breve descripción de la empresa..."
                                        className="resize-none min-h-[100px] w-full"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
