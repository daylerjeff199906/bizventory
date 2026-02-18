import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const productId = params.id

    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    try {
        const supabase = await createClient()

        // 1. Get product with brand
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*, brand:brands(*)')
            .eq('id', productId)
            .single()

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // 2. Get variants
        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)

        if (variantsError) throw variantsError

        const variantIds = variants?.map((v) => v.id) ?? []

        // 3. Get attributes for all variants
        const { data: variantAttributes, error: attributesError } = variantIds.length > 0
            ? await supabase
                .from('product_variant_attributes')
                .select('*')
                .in('variant_id', variantIds)
            : { data: [], error: null }

        if (attributesError) throw attributesError

        // 4. Get inventory movements for stock calculation
        let orQuery = `product_id.eq.${productId}`
        if (variantIds.length > 0) {
            orQuery += `,product_variant_id.in.(${variantIds.join(',')})`
        }

        const { data: movements, error: movementsError } = await supabase
            .from('inventory_movements')
            .select('product_id, product_variant_id, quantity, movement_type, movement_status')
            .or(orQuery)
            .eq('movement_status', 'completed')

        if (movementsError) throw movementsError

        // 5. Calculate stock map
        const stockMap = new Map<string, number>()
        movements?.forEach((m) => {
            const key = m.product_variant_id
                ? `variant:${m.product_variant_id}`
                : `product:${m.product_id}`
            const adjustment = m.movement_type === 'entry' ? m.quantity : -m.quantity
            stockMap.set(key, (stockMap.get(key) || 0) + adjustment)
        })

        // 6. Assemble variants with attributes + stock
        const enrichedVariants = variants?.map((variant) => {
            const attributes = variantAttributes
                ?.filter((attr) => attr.variant_id === variant.id)
                .map((attr) => ({
                    id: attr.id,
                    variant_id: attr.variant_id,
                    attribute_type: attr.attribute_type,
                    attribute_value: attr.attribute_value,
                    created_at: attr.created_at,
                    updated_at: attr.updated_at,
                })) ?? []

            const stock = stockMap.get(`variant:${variant.id}`) || 0
            const price_unit =
                variant.price && variant.price > 0
                    ? variant.price
                    : product.price || 0

            return {
                ...variant,
                attributes,
                stock,
                price_unit,
            }
        }) ?? []

        // 7. Assemble final product
        const productStock = stockMap.get(`product:${productId}`) || 0

        const result = {
            ...product,
            variants: enrichedVariants,
            stock: enrichedVariants.length > 0 ? 0 : productStock,
            price_unit: product.price || 0,
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error in GET /api/products/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
