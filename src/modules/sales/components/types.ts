// Interfaces para atributos de variantes
export interface ProductAttribute {
  attribute_id: string
  attribute_name: string
  attribute_value: string
}

// Interfaz para marcas
export interface Brand {
  id: string
  name: string
  description?: string | null
}

// Interfaz para categorías
export interface Category {
  id: number
  name: string
  description?: string | null
}

// Interfaz para variantes de productos
export interface ProductVariant {
  id: string
  product_id: string
  name: string
  description: string | null
  code: string
  created_at: string
  updated_at: string | null
  stock?: number
  price?: number
  attributes?: ProductAttribute[]
  temp_id?: string // ID temporal para manejo en UI
}

// Interfaz para productos principales
export interface Product {
  id: string
  name: string
  description: string | null
  code: string
  category_id: number | null
  unit: string
  brand_id: string | null
  location: string | null
  created_at: string
  is_active: boolean
  has_variants: boolean
  tags: string[] | null
  updated_at: string | null
  variants?: ProductVariant[]
  stock?: number
  price?: number
  brand?: Brand
  category?: Category
  temp_id?: string // ID temporal para manejo en UI
}

// Interfaz para la respuesta de la API
export interface ProductListResponse {
  data: Product[]
  total_items: number
  total_pages: number
}

// Interfaz para los parámetros de búsqueda
export interface GetProductsWithVariantsAndStockProps {
  searchQuery?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Interfaz para los items de venta
export interface SaleItemInput {
  temp_id: string
  product_id: string
  variant_id?: string
  product_name: string
  quantity: number
  unit_price: number
  discount_amount: number
  total_price: number
  stock?: number
  brand_name?: string
  code?: string
  unit?: string
}

//new type for extended sale item with additional fields
export interface CombinedResultPrice {
  id: string
  name: string
  description?: string | null
  code?: string
  brand_id?: string
  brand?: {
    id: string
    name: string
  }
  stock?: number
  variant_id?: string
  variant_name?: string
  variant_code?: string
  variant_description?: string | null
  attributes?: {
    attribute_type: string
    attribute_value: string
  }[]
  price?: number
  discount?: number
  temp_id?: string // ID temporal para gestión local
}
