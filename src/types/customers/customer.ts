import { Person } from './person'

export interface Customer {
  id: string
  person_id: string
  created_at?: string
  updated_at?: string
}

export interface CustomerList {
  id: string
  person: Person
  created_at?: string
  updated_at?: string
}
