'use client'

import type React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Building2,
  Edit3,
  Save,
  X,
  Upload,
  Mail,
  Phone,
  MapPin,
  FileText,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Image from 'next/image'
import {
  type CompanyInfo,
  type CompanyFormData,
  companyFormSchema
} from '@/modules/settings'
import { updateCompanyInfo } from '@/apis/app'
import { toast } from 'react-toastify'
import { ToastCustom } from '@/components/app/toast-custom'

interface CompanyManagementProps {
  company?: CompanyInfo | null
}

const URL_LOGO_DEFAULT = 'https://www.svgrepo.com/show/354113/nextjs-icon.svg'

export const CompanyManagement = (props: CompanyManagementProps) => {
  const { company: initialCompany } = props

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Configurar react-hook-form con valores por defecto
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialCompany?.name || '',
      legal_name: initialCompany?.legal_name || '',
      tax_number: initialCompany?.tax_number || '',
      address: initialCompany?.address || '',
      phone: initialCompany?.phone || '',
      email: initialCompany?.email || '',
      logo_url: initialCompany?.logo_url || URL_LOGO_DEFAULT
    },
    mode: 'onChange' // Validar en tiempo real
  })

  const {
    watch,
    reset,
    formState: { isDirty, errors }
  } = form

  console.log('Form errors:', errors)

  // Observar el logo_url para mostrar la imagen actualizada
  const currentLogoUrl = watch('logo_url')

  const handleEdit = () => {
    setIsEditing(true)
    setApiError(null)
    setSuccessMessage(null)
    // Resetear el formulario con los valores actuales
    reset({
      name: initialCompany?.name || '',
      legal_name: initialCompany?.legal_name || '',
      tax_number: initialCompany?.tax_number || '',
      address: initialCompany?.address || '',
      phone: initialCompany?.phone || '',
      email: initialCompany?.email || '',
      logo_url: initialCompany?.logo_url || ''
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setApiError(null)
    setSuccessMessage(null)
    // Resetear el formulario a los valores originales
    reset({
      name: initialCompany?.name || '',
      legal_name: initialCompany?.legal_name || '',
      tax_number: initialCompany?.tax_number || '',
      address: initialCompany?.address || '',
      phone: initialCompany?.phone || '',
      email: initialCompany?.email || '',
      logo_url: initialCompany?.logo_url || URL_LOGO_DEFAULT
    })
  }

  const onSubmit = async (data: CompanyFormData) => {
    if (!initialCompany) return

    setIsLoading(true)
    setApiError(null)

    try {
      const response = await updateCompanyInfo(initialCompany.id, {
        name: data.name,
        legal_name: data.legal_name,
        tax_number: data.tax_number,
        address: data.address,
        phone: data.phone,
        email: data.email || null, // Permitir email nulo
        logo_url: URL_LOGO_DEFAULT // Permitir logo_url nulo
      })

      if (!response) {
        toast.error(
          <ToastCustom
            title="Error al actualizar la empresa"
            message="No se pudo actualizar la información de la empresa."
          />
        )
      } else {
        toast.success(
          <ToastCustom
            title="Empresa actualizada"
            message="La información de la empresa se ha actualizado correctamente."
          />
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al actualizar la empresa'
      setApiError(errorMessage)
      toast.error(<ToastCustom title="Error" message={errorMessage} />)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setApiError('Por favor, selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setApiError('El archivo es demasiado grande. Máximo 5MB permitido')
      return
    }

    setIsUploadingLogo(true)
    setApiError(null)

    // try {
    //   const newLogoUrl = await mockApiService.uploadLogo(file)
    //   setValue('logo_url', newLogoUrl, {
    //     shouldValidate: true,
    //     shouldDirty: true
    //   })
    //   setSuccessMessage('Logo actualizado correctamente')
    //   setTimeout(() => setSuccessMessage(null), 3000)
    // } catch (error) {
    //   setApiError(
    //     error instanceof Error ? error.message : 'Error al subir el logo'
    //   )
    // } finally {
    //   setIsUploadingLogo(false)
    // }
  }

  // Loading skeleton
  if (!initialCompany) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted rounded-md"></div>
              <div className="space-y-2">
                <div className="h-8 w-64 bg-muted rounded-md"></div>
                <div className="h-4 w-48 bg-muted rounded-md"></div>
              </div>
            </div>
            <div className="h-10 w-20 bg-muted rounded-md"></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 bg-muted rounded-md"></div>
            <div className="lg:col-span-2 h-80 bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Mensajes de estado */}
      {apiError && (
        <Alert variant="destructive" className="mb-6 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 rounded-md border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Información de la Empresa</h1>
            <p className="text-muted-foreground">
              Gestiona los datos principales de tu empresa
            </p>
          </div>
        </div>

        {!isEditing ? (
          <Button onClick={handleEdit} className="gap-2 rounded-md">
            <Edit3 className="h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="gap-2 rounded-md"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              form="company-form"
              disabled={isLoading || !isDirty}
              className="gap-2 rounded-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      <Form {...form}>
        <form
          id="company-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Logo Section */}
            <Card className="lg:col-span-1 rounded-md">
              <CardHeader>
                <CardTitle className="text-lg">Logo de la Empresa</CardTitle>
                <CardDescription>
                  Imagen representativa de tu empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Image
                      src={
                        currentLogoUrl ||
                        initialCompany.logo_url ||
                        URL_LOGO_DEFAULT
                      }
                      alt="Logo de la empresa"
                      width={120}
                      height={120}
                      className="rounded-md border-2 border-border object-cover"
                    />
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-md hover:border-primary transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">
                          {isUploadingLogo ? 'Subiendo...' : 'Subir nuevo logo'}
                        </span>
                      </div>
                    </label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Formatos: JPG, PNG, GIF. Máximo 5MB.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="lg:col-span-2 rounded-md">
              <CardHeader>
                <CardTitle className="text-lg">Datos de la Empresa</CardTitle>
                <CardDescription>
                  Información básica y de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Nombre Comercial */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Nombre Comercial *
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Input
                              placeholder="Nombre de la empresa"
                              className="rounded-md"
                              {...field}
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {initialCompany.name}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Razón Social */}
                  <FormField
                    control={form.control}
                    name="legal_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Razón Social *
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Input
                              placeholder="Razón social completa"
                              className="rounded-md"
                              {...field}
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {initialCompany.legal_name}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Número de Documento */}
                  <FormField
                    control={form.control}
                    name="tax_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Número de Documento *
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Input
                              placeholder="RUC, NIT, etc."
                              className="rounded-md"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {initialCompany.tax_number}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Teléfono */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Teléfono *
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Input
                              placeholder="+51987654321"
                              className="rounded-md"
                              {...field}
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {initialCompany.phone}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Correo Electrónico
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contacto@empresa.com"
                              className="rounded-md"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {initialCompany.email || 'No especificado'}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dirección */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Dirección *
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Textarea
                              placeholder="Dirección completa de la empresa"
                              rows={3}
                              className="rounded-md"
                              {...field}
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {initialCompany.address}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Creado:</span>
                    <Badge variant="outline" className="text-xs rounded-md">
                      {initialCompany.created_at
                        ? new Date(
                            initialCompany.created_at
                          ).toLocaleDateString('es-ES')
                        : 'No disponible'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Actualizado:</span>
                    <Badge variant="outline" className="text-xs rounded-md">
                      {initialCompany.updated_at
                        ? new Date(
                            initialCompany.updated_at
                          ).toLocaleDateString('es-ES')
                        : 'No disponible'}
                    </Badge>
                  </div>
                </div>

                {/* Indicador de campos requeridos */}
                {isEditing && (
                  <div className="text-xs text-muted-foreground">
                    * Campos requeridos
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  )
}
