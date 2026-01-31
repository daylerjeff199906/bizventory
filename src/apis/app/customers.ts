// suppliers.ts
// Servicio de funciones CRUD para la tabla 'customers' and 'persons' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
import { CustomerList, Person } from '@/types'
import { personSchema, PersonType } from '@/modules/customers'
import { createCustomerSchema, CreateCustomerData } from '@/modules/customers'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'

// import { revalidatePath } from 'next/cache'
// import { APP_URLS } from '@/config/app-urls'

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * Lista proveedores con filtros opcionales
 * @param filters - campos y valores a filtrar
 * @returns Promise<Supplier[]>
 */
export async function getCustomers({
  page = 1,
  pageSize = 10,
  filters,
  sortBy = 'created_at',
  sortDirection = 'desc'
}: {
  page?: number
  pageSize?: number
  filters?: Record<string, string | number | string[] | undefined>
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}): Promise<{
  data: CustomerList[]
  page: number
  page_size: number
  total: number
  total_pages: number
}> {
  const supabase = await getSupabase()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Columnas válidas para ordenar
  const validSortColumns = ['created_at', 'updated_at', 'person_id']

  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`No se puede ordenar por la columna ${sortBy}`)
  }
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

  // Si no hay filtros, retornar la lista normal
  if (!filters || Object.keys(filters).length === 0) {
    const { data, error, count } = await supabase
      .from('customers')
      .select('*, person:person_id(*)', { count: 'exact' })
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(from, to)

    console.log('Data:', data)
    console.log('Error:', error)

    if (error) {
      return {
        data: [],
        page,
        page_size: pageSize,
        total: 0,
        total_pages: 0
      }
    }

    const total = count || 0
    const total_pages = Math.ceil(total / pageSize)

    return {
      data: data || [],
      page,
      page_size: pageSize,
      total,
      total_pages
    }
  }

  // Filtros sobre la tabla person
  let personQuery = supabase.from('person').select('id')
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (Array.isArray(value)) {
          personQuery = personQuery.in(key, value)
        } else if (typeof value === 'string') {
          personQuery = personQuery.ilike(key, `%${value}%`)
        } else {
          personQuery = personQuery.eq(key, value)
        }
      }
    })
  }
  const { data: personIds, error: personError } = await personQuery
  if (personError) {
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
    }
  }
  type PersonId = { id: string }
  const ids = Array.isArray(personIds)
    ? personIds.map((p: PersonId) => p.id)
    : []
  let customerQuery = supabase
    .from('customers')
    .select('*, person:person_id(*)', { count: 'exact' })
    .order(sortColumn, { ascending: sortDirection === 'asc' })
    .range(from, to)

  if (ids.length > 0) {
    customerQuery = customerQuery.in('person_id', ids)
  } else if (filters) {
    // Si hay filtros pero no hay coincidencias en person, retornar vacío
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
    }
  }

  const { data, error, count } = await customerQuery

  if (error) {
    return {
      data: [],
      page,
      page_size: pageSize,
      total: 0,
      total_pages: 0
    }
  }

  const total = count || 0
  const total_pages = Math.ceil(total / pageSize)

  return {
    data: data || [],
    page,
    page_size: pageSize,
    total,
    total_pages
  }
}

/**
 * Obtiene una persona por su ID
 * @param id - ID de la persona
 * @returns Promise<any>
 */
export async function getPersonById(id: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('person')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Error al obtener persona: ${error.message}`)
  }

  return data
}

/**
 * Crea una nueva persona
 * @param personData - Datos de la persona
 * @returns Promise<any>
 */
export async function createPerson(personData: PersonType): Promise<{
  data: Person | null
  error: Error | null
}> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('persons')
    .insert(personData)
    .select()
    .single()

  console.log('Data:', data)
  console.log('Error:', error)

  if (error) {
    console.error('Error al crear persona:', error)
    return {
      data: null,
      error: new Error(`Error al crear persona: ${error.message}`)
    }
  }

  return {
    data: data as Person | null,
    error: null
  }
}

/**
 * Actualiza una persona existente
 * @param id - ID de la persona
 * @param personData - Datos actualizados
 * @returns Promise<any>
 */
export async function updatePerson(id: string, personData: PersonType) {
  const validatedData = personSchema.parse(personData)
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('persons')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar persona: ${error.message}`)
  }

  return data
}

/**
 * Elimina una persona
 * @param id - ID de la persona
 * @returns Promise<void>
 */
export async function deletePerson(id: string) {
  const supabase = await getSupabase()

  // Primero verificar si la persona es cliente
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('person_id', id)
    .maybeSingle()

  if (customerError) {
    throw new Error(`Error al verificar cliente: ${customerError.message}`)
  }

  if (customer) {
    throw new Error(
      'No se puede eliminar la persona porque es un cliente registrado'
    )
  }

  const { error } = await supabase.from('person').delete().eq('id', id)

  if (error) {
    throw new Error(`Error al eliminar persona: ${error.message}`)
  }
}

/**
 * Obtiene un cliente por su ID de persona
 * @param personId - ID de la persona
 * @returns Promise<any>
 */
export async function getCustomerByPersonId(personId: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('customers')
    .select('*, person:person_id(*)')
    .eq('person_id', personId)
    .maybeSingle()

  if (error) {
    throw new Error(`Error al obtener cliente: ${error.message}`)
  }

  return data
}

/**
 * Crea un nuevo cliente
 * @param customerData - Datos del cliente
 * @returns Promise<any>
 */
export async function createCustomer(createCustomerData: CreateCustomerData) {
  const validatedData = createCustomerSchema.parse(createCustomerData)
  const supabase = await getSupabase()

  // Verificar si la persona ya existe
  const { data: existingPerson, error: personError } = await supabase
    .from('persons')
    .select('*')
    .eq('id', validatedData.person_id)
    .single()

  if (personError) {
    throw new Error(`Error al verificar persona: ${personError.message}`)
  }

  if (!existingPerson) {
    throw new Error('La persona asociada no existe')
  }

  // Crear cliente
  const { data, error: customerError } = await supabase
    .from('customers')
    .insert({
      person_id: validatedData.person_id
    })
    .select('*, person:person_id(*)')
    .single()

  if (customerError) {
    throw new Error(`Error al crear cliente: ${customerError.message}`)
  }
  revalidatePath(APP_URLS.CUSTOMERS.LIST)

  return data
}

/**
 * Actualiza un cliente existente
 * @param personId - ID de la persona asociada al cliente
 * @param customerData - Datos actualizados
 * @returns Promise<any>
 */
// export async function updateCustomer(
//   personId: string,
//   customerData: UpdateCustomerData
// ) {
//   const validatedData = updateCustomerSchema.parse(customerData)
//   const supabase = await getSupabase()

//   // Actualizar datos de persona
//   const { data: updatedPerson, error: personError } = await supabase
//     .from('person')
//     .update({ updatePerson })
//     .eq('id', personId)
//     .select()
//     .single()

//   if (personError) {
//     throw new Error(`Error al actualizar persona: ${personError.message}`)
//   }

//   // Actualizar datos de cliente
//   const { data: updatedCustomer, error: customerError } = await supabase
//     .from('customers')
//     .update({
//       additional_info: validatedData.additional_info || null
//     })
//     .eq('person_id', personId)
//     .select('*, person:person_id(*)')
//     .single()

//   if (customerError) {
//     throw new Error(`Error al actualizar cliente: ${customerError.message}`)
//   }

//   return updatedCustomer
// }

/**
 * Elimina un cliente
 * @param personId - ID de la persona asociada al cliente
 * @returns Promise<void>
 */
export async function deleteCustomer(personId: string) {
  const supabase = await getSupabase()

  // Eliminar cliente
  const { error: customerError } = await supabase
    .from('customers')
    .delete()
    .eq('person_id', personId)

  if (customerError) {
    throw new Error(`Error al eliminar cliente: ${customerError.message}`)
  }

  // Nota: No eliminamos la persona asociada ya que podría estar relacionada con otros registros
}
