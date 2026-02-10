
'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfMonth, subMonths, format, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

async function getSupabase() {
    return createClient()
}

export interface DashboardStats {
    sales: {
        totalamount: number
        count: number
    }
    purchases: {
        totalamount: number
        count: number
    }
    customers: {
        count: number
    }
    products: {
        count: number
    }
}

export interface ChartData {
    name: string
    sales: number
    purchases: number
}

export async function getDashboardStats(businessId: string): Promise<DashboardStats> {
    const supabase = await getSupabase()
    const now = new Date()
    const firstDayOfMonth = startOfMonth(now).toISOString()

    // 1. Sales this month
    const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('business_id', businessId)
        .gte('date', firstDayOfMonth)

    const salesTotal = salesData?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0
    const salesCount = salesData?.length || 0

    // 2. Purchases this month
    const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('total_amount, supplier_id, suppliers!inner(business_id)')
        .eq('suppliers.business_id', businessId)
        .gte('date', firstDayOfMonth)

    const purchasesTotal = purchasesData?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0
    const purchasesCount = purchasesData?.length || 0

    // 3. Total Customers
    const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)

    // 4. Total Products
    // Assuming products are linked via brand -> business or directly business_id if exists/inferred
    // Based on context, products have brand_id, and brands have business_id
    const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*, brand:brands!inner(business_id)', { count: 'exact', head: true })
        .eq('brand.business_id', businessId)
        .eq('is_active', true)


    if (salesError) console.error('Error fetching sales stats:', salesError)
    if (purchasesError) console.error('Error fetching purchases stats:', purchasesError)
    if (customersError) console.error('Error fetching customers stats:', customersError)
    if (productsError) console.error('Error fetching products stats:', productsError)

    return {
        sales: {
            totalamount: salesTotal,
            count: salesCount
        },
        purchases: {
            totalamount: purchasesTotal,
            count: purchasesCount
        },
        customers: {
            count: customersCount || 0
        },
        products: {
            count: productsCount || 0
        }
    }
}

export async function getMonthlyChartData(businessId: string): Promise<ChartData[]> {
    const supabase = await getSupabase()
    const now = new Date()
    const sixMonthsAgo = subMonths(startOfMonth(now), 5).toISOString()

    // Fetch all sales in last 6 months
    const { data: salesData } = await supabase
        .from('sales')
        .select('date, total_amount')
        .eq('business_id', businessId)
        .gte('date', sixMonthsAgo)
        .order('date', { ascending: true })

    // Fetch all purchases in last 6 months
    const { data: purchasesData } = await supabase
        .from('purchases')
        .select('date, total_amount, suppliers!inner(business_id)')
        .eq('suppliers.business_id', businessId)
        .gte('date', sixMonthsAgo)
        .order('date', { ascending: true })

    // Aggregate by month
    const monthlyStats = new Map<string, { sales: number; purchases: number }>()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i)
        const key = format(d, 'yyyy-MM') // Key for sorting
        const label = format(d, 'MMM', { locale: es }) // Label for display
        monthlyStats.set(key, { sales: 0, purchases: 0 })
    }

    salesData?.forEach(sale => {
        const monthKey = format(new Date(sale.date), 'yyyy-MM')
        if (monthlyStats.has(monthKey)) {
            const current = monthlyStats.get(monthKey)!
            monthlyStats.set(monthKey, { ...current, sales: current.sales + (Number(sale.total_amount) || 0) })
        }
    })

    purchasesData?.forEach(purchase => {
        const monthKey = format(new Date(purchase.date), 'yyyy-MM')
        if (monthlyStats.has(monthKey)) {
            const current = monthlyStats.get(monthKey)!
            monthlyStats.set(monthKey, { ...current, purchases: current.purchases + (Number(purchase.total_amount) || 0) })
        }
    })

    // Convert to array
    const result: ChartData[] = Array.from(monthlyStats.entries()).map(([key, value]) => {
        const date = new Date(key + '-01')
        return {
            name: format(date, 'MMM', { locale: es }).charAt(0).toUpperCase() + format(date, 'MMM', { locale: es }).slice(1),
            sales: value.sales,
            purchases: value.purchases
        }
    })

    return result
}

export async function getRecentSales(businessId: string): Promise<any[]> {
    const supabase = await getSupabase()
    const { data } = await supabase
        .from('sales')
        .select('*, customer:customers(*, person:persons(*))')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5)

    return data || []
}
