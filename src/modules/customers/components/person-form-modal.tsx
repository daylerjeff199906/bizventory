'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle
// } from '@/components/ui/alert-dialog'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface Person {
  id: string
  name: string
  whatsapp?: string
  secondary_phone?: string
  email?: string
  address?: string
  country?: string
  created_at: string
}

const personSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  whatsapp: z.string().optional(),
  secondary_phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional()
})

type PersonFormData = z.infer<typeof personSchema>

export default function PersonsCRUD() {
  const [persons, setPersons] = useState<Person[]>([
    {
      id: '1',
      name: 'María García',
      whatsapp: '+34 612 345 678',
      secondary_phone: '+34 912 345 678',
      email: 'maria.garcia@email.com',
      address: 'Calle Mayor 123, Madrid',
      country: 'España',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Carlos López',
      whatsapp: '+34 623 456 789',
      email: 'carlos.lopez@email.com',
      address: 'Avenida Libertad 45, Barcelona',
      country: 'España',
      created_at: '2024-01-16T14:20:00Z'
    },
    {
      id: '3',
      name: 'Ana Martínez',
      whatsapp: '+34 634 567 890',
      secondary_phone: '+34 923 456 789',
      email: 'ana.martinez@email.com',
      country: 'España',
      created_at: '2024-01-17T09:15:00Z'
    }
  ])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  //   const [isEditOpen, setIsEditOpen] = useState(false)
  //   const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  //   const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const createForm = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      secondary_phone: '',
      email: '',
      address: '',
      country: ''
    }
  })

  //   const editForm = useForm<PersonFormData>({
  //     resolver: zodResolver(personSchema),
  //     defaultValues: {
  //       name: '',
  //       whatsapp: '',
  //       secondary_phone: '',
  //       email: '',
  //       address: '',
  //       country: ''
  //     }
  //   })

  const handleCreate = (data: PersonFormData) => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: data.name,
      whatsapp: data.whatsapp || undefined,
      secondary_phone: data.secondary_phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      country: data.country || undefined,
      created_at: new Date().toISOString()
    }

    setPersons([...persons, newPerson])
    setIsCreateOpen(false)
    createForm.reset()
  }

  //   const handleEdit = (person: Person) => {
  //     setSelectedPerson(person)
  //     editForm.reset({
  //       name: person.name,
  //       whatsapp: person.whatsapp || '',
  //       secondary_phone: person.secondary_phone || '',
  //       email: person.email || '',
  //       address: person.address || '',
  //       country: person.country || ''
  //     })
  //     setIsEditOpen(true)
  //   }

  //   const handleUpdate = (data: PersonFormData) => {
  //     if (!selectedPerson) return

  //     const updatedPersons = persons.map((person) =>
  //       person.id === selectedPerson.id
  //         ? {
  //             ...person,
  //             name: data.name,
  //             whatsapp: data.whatsapp || undefined,
  //             secondary_phone: data.secondary_phone || undefined,
  //             email: data.email || undefined,
  //             address: data.address || undefined,
  //             country: data.country || undefined
  //           }
  //         : person
  //     )

  //     setPersons(updatedPersons)
  //     setIsEditOpen(false)
  //     setSelectedPerson(null)
  //     editForm.reset()
  //   }

  //   const handleDelete = (person: Person) => {
  //     setSelectedPerson(person)
  //     setIsDeleteOpen(true)
  //   }

  //   const confirmDelete = () => {
  //     if (!selectedPerson) return

  //     const updatedPersons = persons.filter(
  //       (person) => person.id !== selectedPerson.id
  //     )
  //     setPersons(updatedPersons)
  //     setIsDeleteOpen(false)
  //     setSelectedPerson(null)
  //   }

  //   const formatDate = (dateString: string) => {
  //     return new Date(dateString).toLocaleDateString('es-ES', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     })
  //   }

  const handleCreateModalClose = (open: boolean) => {
    setIsCreateOpen(open)
    if (!open) {
      createForm.reset()
    }
  }

  //   const handleEditModalClose = (open: boolean) => {
  //     setIsEditOpen(open)
  //     if (!open) {
  //       editForm.reset()
  //       setSelectedPerson(null)
  //     }
  //   }

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={handleCreateModalClose}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Persona
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nueva Persona</DialogTitle>
            <DialogDescription>
              Completa la información de la nueva persona. Los campos marcados
              con * son obligatorios.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 612 345 678" {...field} />
                    </FormControl>
                    <FormDescription>
                      Número de WhatsApp con código de país
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="secondary_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono Secundario</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 912 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ejemplo@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle, número, ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="España" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Persona</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
