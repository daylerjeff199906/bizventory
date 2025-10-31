import { StatusItems } from '../core'

export interface Brand {
  id?: string
  name: string
  business_id?: string
  created_at?: string
  updated_at?: string
  logo_url?: string | null
  status: StatusItems
}
