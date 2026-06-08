import { getBusinessBySlug, getStorefrontProducts } from '@/apis/app/business'
import { getProductById } from '@/apis/app/product-stock'
import { notFound } from 'next/navigation'
import ProductDetails from '@/components/storefront/product-details'

interface Props {
  params: Promise<{
    slug: string
    productId: string
  }>
}

export default async function StoreProductDetailsPage({ params }: Props) {
  const { slug, productId } = await params

  // 1. Fetch business
  const business = await getBusinessBySlug(slug)
  if (!business || !business.is_public) {
    notFound()
  }

  // 2. Fetch product
  const product = await getProductById(productId)
  if (!product || !product.is_active) {
    notFound()
  }

  // 3. Fetch other products for suggestion
  const { data: storefrontProducts } = await getStorefrontProducts({
    businessId: business.id!,
    page: 1,
    pageSize: 5
  })

  // Filter out the current product
  const relatedProducts = storefrontProducts
    .filter((p) => p.id !== productId)
    .slice(0, 4)

  return (
    <ProductDetails
      product={product}
      business={business}
      relatedProducts={relatedProducts}
    />
  )
}
