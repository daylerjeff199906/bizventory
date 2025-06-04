const URL_PREFIX = '/dashboard'

export const APP_URLS = {
  PRODUCTS: {
    LIST: `${URL_PREFIX}/products`,
    CREATE: `${URL_PREFIX}/products/create`,
    CREATE_VARIANT: (id: string) =>
      `${URL_PREFIX}/products/${id}/create-variant`,
    MULTIMEDIA: (id: string) => `${URL_PREFIX}/products/${id}/media`,
    EDIT: (id: string) => `${URL_PREFIX}/products/${id}/edit`,
    VIEW: (id: string) => `${URL_PREFIX}/products/${id}`,
    PRODUCTS_STOCK: `${URL_PREFIX}/products-stock`,
    DETAIL: (id: string) => `${URL_PREFIX}/products/${id}/details`
  },
  SUPPLIERS: {
    LIST: `${URL_PREFIX}/suppliers`,
    CREATE: `${URL_PREFIX}/suppliers/create`,
    EDIT: (id: string) => `${URL_PREFIX}/suppliers/${id}/edit`,
    VIEW: (id: string) => `${URL_PREFIX}/suppliers/${id}`
  },
  PURCHASES: {
    LIST: `${URL_PREFIX}/purchases`,
    CREATE: `${URL_PREFIX}/purchases/create`,
    EDIT: (id: string) => `${URL_PREFIX}/purchases/${id}/edit`,
    VIEW: (id: string) => `${URL_PREFIX}/purchases/${id}`,
    INVENTORY: `${URL_PREFIX}/inventory`
  }
}
