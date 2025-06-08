'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
  Hash
} from 'lucide-react'
import Image from 'next/image'

interface CompanyInfo {
  id: string
  name: string
  legal_name: string
  tax_number: string
  address: string
  phone: string
  email: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export default function CompanyManagement() {
  const [company, setCompany] = useState<CompanyInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({})

  // Datos de ejemplo - en producción vendrían de tu base de datos
  useEffect(() => {
    // Simular carga de datos
    const mockData: CompanyInfo = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Mi Empresa S.A.C.',
      legal_name: 'Mi Empresa Sociedad Anónima Cerrada',
      tax_number: '20123456789',
      address: 'Av. Principal 123, Lima, Perú',
      phone: '+51 1 234-5678',
      email: 'contacto@miempresa.com',
      logo_url: '/placeholder.svg?height=100&width=100',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-12-07T15:45:00Z'
    }
    setCompany(mockData)
    setFormData(mockData)
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(company || {})
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Simular llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedCompany = {
        ...company!,
        ...formData,
        updated_at: new Date().toISOString()
      }

      setCompany(updatedCompany)
      setIsEditing(false)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simular subida de archivo
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // En producción, aquí subirías el archivo y obtendrías la URL
      const newLogoUrl = '/placeholder.svg?height=100&width=100'

      setFormData((prev) => ({
        ...prev,
        logo_url: newLogoUrl
      }))

      //   toast({
      //     title: '📸 Logo actualizado',
      //     description: 'El logo se ha subido correctamente.',
      //     duration: 3000
      //   })
    } catch {
      //   toast({
      //     title: '❌ Error al subir logo',
      //     description: 'No se pudo subir el logo. Inténtalo nuevamente.',
      //     variant: 'destructive',
      //     duration: 4000
      //   })
    } finally {
      setIsLoading(false)
    }
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Información de la Empresa</h1>
            <p className="text-muted-foreground">
              Gestiona los datos principales de tu empresa
            </p>
          </div>
        </div>

        {!isEditing ? (
          <Button onClick={handleEdit} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Logo Section */}
        <Card className="lg:col-span-1">
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
                    formData.logo_url ||
                    '/placeholder.svg?height=120&width=120&query=company logo'
                  }
                  alt="Logo de la empresa"
                  width={120}
                  height={120}
                  className="rounded-lg border-2 border-border object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Subir nuevo logo</span>
                  </div>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={isLoading}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Datos de la Empresa</CardTitle>
            <CardDescription>Información básica y de contacto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Nombre Comercial
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nombre de la empresa"
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {company.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_name" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Razón Social
                </Label>
                {isEditing ? (
                  <Input
                    id="legal_name"
                    value={formData.legal_name || ''}
                    onChange={(e) =>
                      handleInputChange('legal_name', e.target.value)
                    }
                    placeholder="Razón social completa"
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {company.legal_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_number" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Número de Documento
                </Label>
                {isEditing ? (
                  <Input
                    id="tax_number"
                    value={formData.tax_number || ''}
                    onChange={(e) =>
                      handleInputChange('tax_number', e.target.value)
                    }
                    placeholder="RUC, NIT, etc."
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {company.tax_number}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+51 1 234-5678"
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {company.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo Electrónico
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contacto@empresa.com"
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {company.email || 'No especificado'}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección
                </Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    placeholder="Dirección completa de la empresa"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {company.address}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Creado:</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(company.created_at).toLocaleDateString('es-ES')}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span>Actualizado:</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(company.updated_at).toLocaleDateString('es-ES')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
