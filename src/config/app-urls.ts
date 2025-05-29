const URL_PREFIX = '/dashboard'

export const APP_URLS = {
  SUPPLIERS: {
    LIST: `${URL_PREFIX}/suppliers`,
    CREATE: `${URL_PREFIX}/suppliers/create`,
    EDIT: (id: string) => `${URL_PREFIX}/suppliers/${id}/edit`,
    VIEW: (id: string) => `${URL_PREFIX}/suppliers/${id}`
  }
}
