import { StatusItems } from '../core'

export interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  currency: string
  status: StatusItems
  notes: string
  created_at: string
  updated_at: string
  company_type: string
  document_type: string
  document_number: string
}
