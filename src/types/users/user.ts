import { Pagination } from '../core'

export interface User {
  id: string
  name: string
  email: string
  created_at: string
  role: string[] | null
}

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  is_super_admin: boolean
}

// Aliases for compatibility
export type IUser = User
export type IProfile = Profile

export interface IUserRole {
  id: string
  user_id: string
  roles: string[]
  institution_id?: string | null
  access_enabled?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  role_action?: string[] | null
}

export interface IUserRoleFull extends IUserRole {
  user: Profile | null
}

export interface IUserFilter extends Pagination {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  roles?: string[]
}
