import type { ProductVariantsData } from '@/modules/products'

interface CreateVariantsParams {
  productId: string
  variants: ProductVariantsData
}

export const createProductVariants = async ({
  productId,
  variants
}: CreateVariantsParams) => {
  try {
    const response = await fetch(`/api/products/${productId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variants })
    })

    if (!response.ok) {
      throw new Error('Error al crear las variantes del producto')
    }

    return await response.json()
  } catch (error) {
    console.error('Error en createProductVariants:', error)
    return null
  }
}
