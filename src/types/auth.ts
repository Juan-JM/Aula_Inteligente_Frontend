export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  groups: string[]
  user_permissions?: string[]
  date_joined: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

// Add the missing LoginRequest type
export interface LoginRequest {
  username: string
  password: string
}

// Add the missing LoginResponse type
export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface RefreshResponse {
  access: string
}
