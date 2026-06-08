
'use server'

import { createClient } from '@/utils/supabase/server'
import { BusinessForm, businessSchema, generateSlug } from '@/schemas/business/register.busines'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
    return createClient()
}

async function generateUniqueSlug(baseSlug: string, businessId: string): Promise<string> {
    if (!baseSlug) {
        return ''
    }

    const supabase = await getSupabase()
    let slug = baseSlug
    let counter = 1
    let isUnique = false

    while (!isUnique) {
        const { data: existing } = await supabase
            .from('business')
            .select('id, slug')
            .eq('slug', slug)
            .neq('id', businessId)
            .maybeSingle()

        if (!existing) {
            isUnique = true
        } else {
            slug = `${baseSlug}-${counter}`
            counter++
        }
    }

    return slug
}

export async function getBusinessById(id: string): Promise<BusinessForm | null> {
    const supabase = await getSupabase()
    const { data, error } = await supabase
        .from('business')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching business:', error)
        return null
    }

    return data
}

export async function updateBusiness(id: string, data: Partial<BusinessForm>) {
    const supabase = await getSupabase()

    // Generate unique slug if provided or if business_name changed
    let slug = data.slug
    if (data.business_name && (!slug || slug === '')) {
        slug = generateSlug(data.business_name)
    }
    
    if (slug && slug !== '') {
        slug = await generateUniqueSlug(slug, id)
    }

    // Validate data partially
    const validatedData = businessSchema.partial().parse({
        ...data,
        slug
    })

    const { data: updatedBusiness, error } = await supabase
        .from('business')
        .update({
            ...validatedData,
            slug,
            updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`Error updating business: ${error.message}`)
    }

    revalidatePath(`/dashboard/${id}/settings`)
    revalidatePath(`/dashboard/${id}`, 'layout')
    if (slug) {
        revalidatePath(`/store/${slug}`)
    }

    return updatedBusiness
}

export async function getCategoriesByBusiness(businessId: string) {
    const supabase = await getSupabase()
    
    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return categories || []
}

export async function getBusinessBySlug(slug: string): Promise<BusinessForm | null> {
    const supabase = await getSupabase()
    const { data, error } = await supabase
        .from('business')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching business by slug:', error)
        return null
    }

    return data
}

export async function getStorefrontProducts({
    businessId,
    page = 1,
    pageSize = 12,
    search = ''
}: {
    businessId: string
    page?: number
    pageSize?: number
    search?: string
}) {
    const supabase = await getSupabase()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    try {
        const { data: brands, error: brandsError } = await supabase
            .from('brands')
            .select('id')
            .eq('business_id', businessId)

        if (brandsError) throw brandsError
        const brandIds = brands?.map((b) => b.id) || []
        if (brandIds.length === 0) return { data: [], total: 0, totalPages: 0 }

        let query = supabase
            .from('products')
            .select('*, brand:brands!inner(*)', { count: 'exact' })
            .in('brand_id', brandIds)
            .eq('is_active', true)

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data: products, count, error: productsError } = await query
            .range(from, to)
            .order('created_at', { ascending: false })

        if (productsError) throw productsError
        if (!products || products.length === 0) return { data: [], total: 0, totalPages: 0 }

        const productIds = products.map((p) => p.id)

        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds)
            .eq('is_active', true)

        if (variantsError) throw variantsError

        const variantIds = variants?.map((v) => v.id) || []
        let variantAttributes: any[] = []
        if (variantIds.length > 0) {
            const { data: attrs, error: attrsError } = await supabase
                .from('product_variant_attributes')
                .select('*')
                .in('variant_id', variantIds)
            if (attrsError) throw attrsError
            variantAttributes = attrs || []
        }

        let orQuery = ''
        if (productIds.length > 0) {
            orQuery += `product_id.in.(${productIds.join(',')})`
        }
        if (variantIds.length > 0) {
            if (orQuery) orQuery += ','
            orQuery += `product_variant_id.in.(${variantIds.join(',')})`
        }

        let movements: any[] = []
        if (orQuery) {
            const { data, error: movementsError } = await supabase
                .from('inventory_movements')
                .select('product_id, product_variant_id, quantity, movement_type, movement_status')
                .or(orQuery)
                .eq('movement_status', 'completed')

            if (movementsError) throw movementsError
            movements = data || []
        }

        const stockMap = new Map<string, number>()
        movements.forEach((movement) => {
            const key = movement.product_variant_id
                ? `variant:${movement.product_variant_id}`
                : `product:${movement.product_id}`
            const adjustment = movement.movement_type === 'entry' ? movement.quantity : -movement.quantity
            stockMap.set(key, (stockMap.get(key) || 0) + adjustment)
        })

        const processedProducts = products.map((product) => {
            const productVariants = variants?.filter((v) => v.product_id === product.id) || []

            if (productVariants.length > 0) {
                const variantsWithStockAndAttributes = productVariants.map((variant) => {
                    const attributes = variantAttributes
                        ?.filter((attr) => attr.variant_id === variant.id)
                        .map((attr) => ({
                            attribute_type: attr.attribute_type,
                            attribute_value: attr.attribute_value
                        }))
                    const variantStock = stockMap.get(`variant:${variant.id}`) || 0
                    const variantPrice = (variant.price && variant.price > 0) ? variant.price : (product.price || 0)

                    return {
                        ...variant,
                        stock: variantStock,
                        attributes: attributes || [],
                        price_unit: variantPrice
                    }
                })

                return {
                    ...product,
                    variants: variantsWithStockAndAttributes,
                    stock: 0,
                    price_unit: product.price || 0
                }
            }

            return {
                ...product,
                stock: stockMap.get(`product:${product.id}`) || 0,
                variants: undefined,
                price_unit: product.price || 0
            }
        })

        const total = count || 0
        return {
            data: processedProducts,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    } catch (error) {
        console.error('Error in getStorefrontProducts:', error)
        return { data: [], total: 0, totalPages: 0 }
    }
}

export async function getAllStorefrontProducts({
    page = 1,
    pageSize = 12,
    search = ''
}: {
    page?: number
    pageSize?: number
    search?: string
} = {}) {
    const supabase = await getSupabase()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    try {
        const { data: businesses, error: busError } = await supabase
            .from('business')
            .select('id, business_name, slug, brand')
            .eq('is_public', true)

        if (busError) throw busError
        if (!businesses || businesses.length === 0) return { data: [], total: 0, totalPages: 0 }

        const businessIds = businesses.map((b) => b.id)

        const { data: brands, error: brandsError } = await supabase
            .from('brands')
            .select('id, business_id')
            .in('business_id', businessIds)

        if (brandsError) throw brandsError
        const brandIds = brands?.map((b) => b.id) || []
        if (brandIds.length === 0) return { data: [], total: 0, totalPages: 0 }

        const brandToBusinessMap = new Map<string, any>()
        brands.forEach((br) => {
            const bus = businesses.find((b) => b.id === br.business_id)
            if (br.id && bus) {
                brandToBusinessMap.set(br.id, bus)
            }
        })

        let query = supabase
            .from('products')
            .select('*, brand:brands!inner(*)', { count: 'exact' })
            .in('brand_id', brandIds)
            .eq('is_active', true)

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data: products, count, error: productsError } = await query
            .range(from, to)
            .order('created_at', { ascending: false })

        if (productsError) throw productsError
        if (!products || products.length === 0) return { data: [], total: 0, totalPages: 0 }

        const productIds = products.map((p) => p.id)

        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds)
            .eq('is_active', true)

        if (variantsError) throw variantsError

        const variantIds = variants?.map((v) => v.id) || []
        let variantAttributes: any[] = []
        if (variantIds.length > 0) {
            const { data: attrs, error: attrsError } = await supabase
                .from('product_variant_attributes')
                .select('*')
                .in('variant_id', variantIds)
            if (attrsError) throw attrsError
            variantAttributes = attrs || []
        }

        let orQuery = ''
        if (productIds.length > 0) {
            orQuery += `product_id.in.(${productIds.join(',')})`
        }
        if (variantIds.length > 0) {
            if (orQuery) orQuery += ','
            orQuery += `product_variant_id.in.(${variantIds.join(',')})`
        }

        let movements: any[] = []
        if (orQuery) {
            const { data, error: movementsError } = await supabase
                .from('inventory_movements')
                .select('product_id, product_variant_id, quantity, movement_type, movement_status')
                .or(orQuery)
                .eq('movement_status', 'completed')

            if (movementsError) throw movementsError
            movements = data || []
        }

        const stockMap = new Map<string, number>()
        movements.forEach((movement) => {
            const key = movement.product_variant_id
                ? `variant:${movement.product_variant_id}`
                : `product:${movement.product_id}`
            const adjustment = movement.movement_type === 'entry' ? movement.quantity : -movement.quantity
            stockMap.set(key, (stockMap.get(key) || 0) + adjustment)
        })

        const combined = products.map((product) => {
            const businessInfo = brandToBusinessMap.get(product.brand_id)
            const productVariants = variants?.filter((v) => v.product_id === product.id) || []

            let variantsWithStockAndAttributes: any[] = []
            if (productVariants.length > 0) {
                variantsWithStockAndAttributes = productVariants.map((variant) => {
                    const attributes = variantAttributes
                        ?.filter((attr) => attr.variant_id === variant.id)
                        .map((attr) => ({
                            attribute_type: attr.attribute_type,
                            attribute_value: attr.attribute_value
                        }))
                    const variantStock = stockMap.get(`variant:${variant.id}`) || 0
                    const variantPrice = (variant.price && variant.price > 0) ? variant.price : (product.price || 0)

                    return {
                        ...variant,
                        stock: variantStock,
                        attributes: attributes || [],
                        price_unit: variantPrice
                    }
                })
            }

            return {
                ...product,
                business: businessInfo,
                variants: productVariants.length > 0 ? variantsWithStockAndAttributes : undefined,
                stock: productVariants.length > 0 ? 0 : (stockMap.get(`product:${product.id}`) || 0),
                price_unit: product.price || 0
            }
        })

        const total = count || 0
        return {
            data: combined,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    } catch (e) {
        console.error(e)
        return { data: [], total: 0, totalPages: 0 }
    }
}
