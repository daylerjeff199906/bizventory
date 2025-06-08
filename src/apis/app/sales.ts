// sales.ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { APP_URLS } from '@/config/app-urls'
import { z } from 'zod'
// import { CombinedResult, CombinedResultExtended } from './product.variants.list'

// Type definitions
export type Sale = {
  id: string
  date: string
  total_amount: number
  customer_id: string | null
  status: string
  payment_method: string | null
  shipping_address: string | null
  tax_amount: number
  discount_amount: number
  total_items: number
  reference_number: string
  salesperson_id: string | null
  created_at: string
  updated_at: string
}

export type SaleItem = {
  id: string
  sale_id: string
  product_id: string | null
  product_variant_id: string | null
  quantity: number
  unit_price: number
  discount_amount: number
  total_price: number
  created_at: string
  updated_at: string
}

export type SaleWithItems = Sale & {
  //   items: CombinedResultExtended[]
  customer: Customer | null
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}

export type SaleList = Sale & {
  customer: Customer | null
}

export type ResApi<T> = {
  data: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

// Schema for validation
export const SaleSchema = z.object({
  reference_number: z.string().min(1, 'Reference number is required'),
  date: z.string().min(1, 'Date is required'),
  customer_id: z.string().nullable(),
  status: z.string().default('pending'),
  payment_method: z.string().nullable(),
  shipping_address: z.string().nullable(),
  tax_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  total_items: z.number().min(1).default(1),
  total_amount: z.number().min(0),
  salesperson_id: z.string().nullable(),
  items: z.array(
    z.object({
      product_id: z.string().nullable(),
      product_variant_id: z.string().nullable(),
      quantity: z.number().min(1),
      unit_price: z.number().min(0),
      discount_amount: z.number().min(0).default(0),
      total_price: z.number().min(0)
    })
  )
})

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

/**
 * List sales with optional filters
 * @param filters - fields and values to filter
 * @returns Promise<Sale[]>
 */
export async function getSales({
  filters,
  sortBy = 'date',
  sortDirection = 'desc',
  page,
  pageSize
}: {
  page?: number
  pageSize?: number
  filters?: Partial<Sale>
  sortBy: string
  sortDirection: 'asc' | 'desc'
}): Promise<ResApi<SaleList>> {
  const supabase = await getSupabase()
  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? 10
  const from = (currentPage - 1) * currentPageSize
  const to = from + currentPageSize - 1

  // Valid columns for sorting
  const validSortColumns = [
    'id',
    'date',
    'created_at',
    'updated_at',
    'reference_number',
    'total_amount',
    'status'
  ]
  if (sortBy && !validSortColumns.includes(sortBy)) {
    throw new Error(`Cannot sort by column ${sortBy}`)
  }
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'

  let query = supabase
    .from('sales')
    .select('*, customer:customers(*)')
    .range(from, to)
    .order(sortColumn, { ascending: sortDirection === 'asc' })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'string') {
          query = query.ilike(key, `%${value}%`)
        } else {
          query = query.eq(key, value)
        }
      }
    })
  }

  query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

  const { data, error, count } = await query
  if (error) throw error

  return {
    data: data || [],
    page: currentPage,
    page_size: currentPageSize,
    total: count || 0,
    total_pages: Math.ceil((count || 0) / currentPageSize)
  }
}

/**
 * Get a sale by ID with items and customer
 * @param id - UUID of the sale
 * @returns Promise<SaleWithItems | null>
 */
// export async function getSaleById(id: string): Promise<SaleWithItems | null> {
//   const supabase = await getSupabase()

//   // Get the sale with customer
//   const { data: saleData, error: saleError } = await supabase
//     .from('sales')
//     .select('*, customer:customers(*)')
//     .eq('id', id)
//     .single()

//   if (saleError || !saleData) {
//     throw saleError || new Error('Sale not found')
//   }

//   // Get sale items with product and variant details
//   const { data: itemsData, error: itemsError } = await supabase
//     .from('sale_items')
//     .select(
//       `
//       *,
//       product:products(*, brand:brands(*)),
//       variant:product_variants(
//         id,
//         name,
//         description,
//         code,
//         attributes:product_variant_attributes(*)
//       )
//     `
//     )
//     .eq('sale_id', id)

//   if (itemsError) {
//     console.error(itemsError)
//     return null
//   }

//   // Map data to CombinedResult structure
//   const items =
//     itemsData?.map((item) => {
//       const baseProduct = item.product
//         ? {
//             ...item.product,
//             brand: item.product.brand || null,
//             images: item.product.images || null
//           }
//         : null

//       const variantData = item.variant
//         ? {
//             variant_id: item.variant.id,
//             variant_name: item.variant.name,
//             variant_description: item.variant.description,
//             variant_code: item.variant.code,
//             attributes: item.variant.attributes
//           }
//         : {}

//       return {
//         ...baseProduct,
//         ...variantData,
//         // Specific fields from sale_item
//         quantity: item.quantity,
//         unit_price: item.unit_price,
//         discount_amount: item.discount_amount,
//         total_price: item.total_price
//       } as CombinedResultExtended
//     }) || []

//   return { ...saleData, items, customer: saleData.customer || null }
// }

/**
 * Create a new sale with its items
 * @param saleData - validated data with SaleSchema
 * @returns Promise<Sale>
 */
export async function createSale({
  saleData
}: {
  saleData: z.infer<typeof SaleSchema>
}): Promise<Sale> {
  const supabase = await getSupabase()

  // Validate data with schema
  const validatedData = SaleSchema.parse(saleData)

  // Start transaction
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      reference_number: validatedData.reference_number,
      date: validatedData.date,
      customer_id: validatedData.customer_id,
      status: validatedData.status,
      payment_method: validatedData.payment_method,
      shipping_address: validatedData.shipping_address,
      tax_amount: validatedData.tax_amount,
      discount_amount: validatedData.discount_amount,
      total_items: validatedData.total_items,
      total_amount: validatedData.total_amount,
      salesperson_id: validatedData.salesperson_id
    })
    .select()
    .single()

  if (saleError || !sale) {
    throw saleError || new Error('Sale creation failed')
  }

  // Insert sale items
  const { error: itemsError } = await supabase.from('sale_items').insert(
    validatedData.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      total_price: item.total_price
    }))
  )

  if (itemsError) {
    // If item insertion fails, delete the created sale
    await supabase.from('sales').delete().eq('id', sale.id)
    throw itemsError
  }

  revalidatePath(APP_URLS.SALES.LIST)
  return sale
}

/**
 * Update a complete sale
 * @param id - UUID of the sale
 * @param updated - fields to update validated with SaleSchema
 * @returns Promise<Sale>
 */
export async function updateSale({
  id,
  updated
}: {
  id: string
  updated: z.infer<typeof SaleSchema>
}): Promise<Sale> {
  const supabase = await getSupabase()
  const validatedData = SaleSchema.parse(updated)

  // Update the sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .update({
      reference_number: validatedData.reference_number,
      date: validatedData.date,
      customer_id: validatedData.customer_id,
      status: validatedData.status,
      payment_method: validatedData.payment_method,
      shipping_address: validatedData.shipping_address,
      tax_amount: validatedData.tax_amount,
      discount_amount: validatedData.discount_amount,
      total_items: validatedData.total_items,
      total_amount: validatedData.total_amount,
      salesperson_id: validatedData.salesperson_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (saleError || !sale) {
    throw saleError || new Error('Sale update failed')
  }

  // Delete old items and add new ones
  const { error: deleteError } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', id)

  if (deleteError) throw deleteError

  const { error: itemsError } = await supabase.from('sale_items').insert(
    validatedData.items.map((item) => ({
      sale_id: id,
      product_id: item.product_id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      total_price: item.total_price
    }))
  )

  if (itemsError) throw itemsError

  revalidatePath(APP_URLS.SALES.LIST)
  revalidatePath(`${APP_URLS.SALES.EDIT}/${id}`)
  return sale
}

/**
 * Update a single field of a sale
 * @param id - UUID of the sale
 * @param field - field name
 * @param value - new value
 * @returns Promise<Sale>
 */
export async function patchSaleField(
  id: string,
  field: keyof Sale,
  value: Sale[keyof Sale]
): Promise<Sale> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('sales')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw error || new Error('Patch failed')
  revalidatePath(APP_URLS.SALES.LIST)
  revalidatePath(`${APP_URLS.SALES.VIEW(id)}`)
  return data
}

/**
 * Delete a sale by ID
 * @param id - UUID of the sale
 * @returns Promise<void>
 */
export async function deleteSale(id: string): Promise<void> {
  const supabase = await getSupabase()

  // First delete associated items
  const { error: itemsError } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', id)

  if (itemsError) throw itemsError

  // Then delete the sale
  const { error } = await supabase.from('sales').delete().eq('id', id)

  if (error) throw error

  revalidatePath(APP_URLS.SALES.LIST)
}

/**
 * Update the status field of a sale and execute additional logic if 'completed'
 * @param id - UUID of the sale
 * @param status - new status ('pending', 'completed', etc.)
 * @returns Promise<Sale>
 */
export async function updateSaleStatus(
  id: string,
  status: string
): Promise<Sale> {
  const supabase = await getSupabase()

  // Update the status field
  const { data: sale, error } = await supabase
    .from('sales')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !sale) throw error || new Error('Status update failed')

  // If new status is 'completed', execute RPC function to update stock
  if (status === 'completed') {
    const { error: stockError } = await supabase.rpc(
      'update_product_stock_after_sale',
      {
        p_sale_id: sale.id
      }
    )
    if (stockError) throw stockError
  }

  revalidatePath(APP_URLS.SALES.LIST)
  revalidatePath(`${APP_URLS.SALES.VIEW(id)}`)
  return sale
}
