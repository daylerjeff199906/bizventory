import { z } from 'zod'

export const userSchema = z.object({
    firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }).max(50),
    lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres' }).max(50),
    email: z.string().email({ message: 'El correo electrónico no es válido' }),
    isSuperAdmin: z.boolean().default(false),
    isActive: z.boolean().default(true),
})

export type UserForm = z.infer<typeof userSchema>
