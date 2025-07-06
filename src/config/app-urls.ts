const URL_PREFIX = '/dashboard'

export const APP_URLS = {
  BASE: URL_PREFIX,
  PRODUCTS: {
    LIST: `${URL_PREFIX}/products`,
    CREATE: `${URL_PREFIX}/products/create`,
    CREATE_VARIANT: (id: string) =>
      `${URL_PREFIX}/products/${id}/create-variant`,
    MULTIMEDIA: (id: string) => `${URL_PREFIX}/products/${id}/media`,
    EDIT: (id: string) => `${URL_PREFIX}/products/${id}`,
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
    RECEIPTS: {
      LIST: `${URL_PREFIX}/purchases/receipts`,
      DETAIL: (uuid: string) => `${URL_PREFIX}/purchases/receipts/${uuid}`
    },
    INVENTORY: `${URL_PREFIX}/inventory`
  },
  SALES: {
    LIST: `${URL_PREFIX}/sales`,
    CREATE: `${URL_PREFIX}/sales/create`,
    EDIT: (id: string) => `${URL_PREFIX}/sales/${id}/edit`,
    VIEW: (id: string) => `${URL_PREFIX}/sales/${id}`,
    TICKETS: {
      LIST: `${URL_PREFIX}/sales/tickets`,
      DETAIL: (uuid: string) => `${URL_PREFIX}/sales/tickets/${uuid}`
    }
  },
  CUSTOMERS: {
    LIST: `${URL_PREFIX}/customers`,
    CREATE: `${URL_PREFIX}/customers/create`,
    EDIT: (id: string) => `${URL_PREFIX}/customers/${id}/edit`,
    VIEW: (id: string) => `${URL_PREFIX}/customers/${id}`
  },
  SETTINGS: {
    GENERAL: `${URL_PREFIX}/settings`
  },
  BRANDS: {
    LIST: `${URL_PREFIX}/brands`
  }
}
