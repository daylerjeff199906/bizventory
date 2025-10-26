import { Pagination } from '../core'

export interface IUser {
  id?: string
  first_name: string
  last_name: string
  profile_image: string | null
  country: string | null
  birth_date: Date | null
  phone: string | null
  email: string | null
  created_at: Date | null
  updated_at: Date | null
  gender: string | null
  username?: string | null
}

export interface IUserRole {
  id: string
  user_id: string
  role: string
  institution_id?: string | null
  access_enabled?: boolean | null
  created_at?: Date | null
  updated_at?: Date | null
  role_action?: string[] | null
}

export interface IUserRoleFull extends IUserRole {
  user: IUser | null
}

export interface IUserFilter extends Pagination {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  role?: string
}
