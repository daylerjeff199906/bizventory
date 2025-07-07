'use server'
import { createClient } from '@/utils/supabase/server'

// Definición de tipos
interface ReportItem {
  id: number
  date: string
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_amount: number
  // ... otros campos relevantes
}

interface SalesReportItem extends ReportItem {
  customer_id?: number
  customer_name?: string
}

interface PurchasesReportItem extends ReportItem {
  supplier_id?: number
  supplier_name?: string
}

/**
 * Instancia de Supabase en contexto de servidor
 */
async function getSupabase() {
  const supabase = createClient()
  return supabase
}

// Ejemplo: Obtener reporte de ventas sin filtrar por producto
export async function getSalesReportAllProducts({
  startDate,
  endDate
}: {
  startDate: string
  endDate: string
}): Promise<SalesReportItem[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.rpc('get_sales_report', {
    p_start_date: startDate,
    p_end_date: endDate
  })

  if (error) throw error
  return data as SalesReportItem[]
}

// Ejemplo: Obtener reporte de ventas filtrando por un producto específico
export async function getSalesReportForProduct(
  startDate: string,
  endDate: string,
  productId: number
): Promise<SalesReportItem[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.rpc('get_sales_report', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_product_id: productId
  })

  if (error) throw error
  return data as SalesReportItem[]
}

// Ejemplo: Obtener reporte de compras sin filtrar por producto
export async function getPurchasesReportAllProducts({
  startDate,
  endDate
}: {
  startDate: string
  endDate: string
}): Promise<PurchasesReportItem[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.rpc('get_purchases_report', {
    p_start_date: startDate,
    p_end_date: endDate
  })

  if (error) throw error
  return data as PurchasesReportItem[]
}

// Ejemplo: Obtener reporte de compras filtrando por un producto específico
export async function getPurchasesReportForProduct(
  startDate: string,
  endDate: string,
  productId: number
): Promise<PurchasesReportItem[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase.rpc('get_purchases_report', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_product_id: productId
  })

  if (error) throw error
  return data as PurchasesReportItem[]
}
