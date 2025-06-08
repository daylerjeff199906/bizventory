// // companyInfo.ts
// // Servicio de funciones CRUD para la tabla 'company_info' usando Supabase en Server Components
'use server'
import { createClient } from '@/utils/supabase/server'
import { CompanyInfo } from '@/types/core/company-info'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { UpdateCompanyInput } from '@/modules/settings'
// import { revalidatePath } from 'next/cache'
// import { APP_URLS } from '@/config/app-urls'
// import { CreateCompanyInfoData } from '@/modules/companyInfo'

// /**
//  * Instancia de Supabase en contexto de servidor
//  */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

// export interface ResApi<T> {
//   data: T[]
//   page: number
//   page_size: number
//   total: number
//   total_pages: number
// }

// /**
//  * Lista información de la empresa con paginación y filtros opcionales
//  * @param page - número de página (base 1)
//  * @param pageSize - tamaño de la página
//  * @param filters - campos y valores a filtrar
//  * @returns Promise<ResApi<CompanyInfo>>
//  */
// export async function getCompanyInfo({
//   page = 1,
//   pageSize = 10,
//   filters,
//   sortBy = 'created_at', // Valor por defecto
//   sortDirection = 'desc' // 'asc' | 'desc'
// }: {
//   page?: number
//   pageSize?: number
//   filters?: Record<string, string | number | string[] | undefined>
//   sortBy?: string
//   sortDirection?: 'asc' | 'desc'
// }): Promise<ResApi<CompanyInfo>> {
//   const supabase = await getSupabase()
//   const from = (page - 1) * pageSize
//   const to = from + pageSize - 1

//   // Columnas válidas para ordenar
//   const validSortColumns = ['created_at', 'updated_at', 'name', 'tax_number']

//   // Antes de hacer la consulta
//   if (sortBy && !validSortColumns.includes(sortBy)) {
//     throw new Error(`No se puede ordenar por la columna ${sortBy}`)
//   }

//   // Validar que la columna de ordenación exista
//   const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

//   let query = supabase
//     .from('company_info')
//     .select('*', { count: 'exact' })
//     .range(from, to)
//     .order(sortColumn, { ascending: sortDirection === 'asc' })

//   if (filters) {
//     Object.entries(filters).forEach(([key, value]) => {
//       if (
//         value !== undefined &&
//         value !== null &&
//         value !== '' &&
//         !(Array.isArray(value) && value.length === 0)
//       ) {
//         if (Array.isArray(value)) {
//           query = query.in(key, value)
//         } else if (typeof value === 'string') {
//           query = query.ilike(key, `%${value}%`)
//         } else {
//           query = query.eq(key, value)
//         }
//       }
//     })
//   }

//   const { data, error, count } = await query.order('created_at', {
//     ascending: false
//   })

//   if (error)
//     return {
//       data: [],
//       page,
//       page_size: pageSize,
//       total: 0,
//       total_pages: 0
//     }

//   const total = count || 0
//   const total_pages = Math.ceil(total / pageSize)

//   return {
//     data: data || [],
//     page,
//     page_size: pageSize,
//     total,
//     total_pages
//   }
// }

// /**
//  * Crea una nueva información de la empresa
//  * @param newCompanyInfo - datos para creación
//  * @returns Promise<CompanyInfo>
//  */
// export async function createCompanyInfo({
//   newCompanyInfo
// }: {
//   newCompanyInfo: CreateCompanyInfoData
// }): Promise<CompanyInfo | null> {
//   const supabase = await getSupabase()
//   const { data, error } = await supabase
//     .from('company_info')
//     .insert(newCompanyInfo)
//     .select()
//     .single()

//   if (error || !data) {
//     return null
//   }
//   revalidatePath(APP_URLS.COMPANY_INFO.LIST)
//   return data
// }

// /**
//  * Actualiza un solo campo de la información de la empresa
//  * @param id - UUID de la empresa
//  * @param field - nombre del campo
//  * @param value - nuevo valor
//  * @returns Promise<CompanyInfo>
//  */
// export async function patchCompanyInfoField(
//   id: string,
//   field: keyof CompanyInfo,
//   value: CompanyInfo[keyof CompanyInfo]
// ): Promise<CompanyInfo> {
//   const supabase = await getSupabase()
//   const { data, error } = await supabase
//     .from('company_info')
//     .update({ [field]: value })
//     .eq('id', id)
//     .select()
//     .single()

//   if (error || !data) throw error || new Error('Patch failed')
//   revalidatePath(APP_URLS.COMPANY_INFO.LIST)
//   return data
// }

// /**
//  * Elimina la información de la empresa por ID
//  * @param id - UUID de la empresa
//  * @returns Promise<void>
//  */
// export async function deleteCompanyInfo(id: string): Promise<void> {
//   const supabase = await getSupabase()
//   const { error } = await supabase.from('company_info').delete().eq('id', id)

//   if (error) throw error
//   revalidatePath(APP_URLS.COMPANY_INFO.LIST)
// }

// /**
//  * Obtiene la información de la empresa por su ID
//  * @param id - UUID de la empresa
//  * @returns Promise<CompanyInfo>
//  */
export async function getCompanyInfoById(
  id: string
): Promise<CompanyInfo | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

// /**
//  * Actualiza la información completa de la empresa
//  * @param id - UUID de la empresa
//  * @param updated - campos a actualizar
//  * @returns Promise<CompanyInfo>
//  */
export async function updateCompanyInfo(
  id: string,
  updated: Partial<UpdateCompanyInput>
): Promise<CompanyInfo | null> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('company_info')
    .update(updated)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return null
  revalidatePath(APP_URLS.SETTINGS.GENERAL)
  return data
}
