export interface CompanyInfo {
  id: string // UUID maps to string in TypeScript
  name: string
  legal_name: string
  tax_number: string
  address: string
  phone: string
  email: string | null
  logo_url: string | null
  created_at: Date | null
  updated_at: Date | null
}
