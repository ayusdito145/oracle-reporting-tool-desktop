export interface AuthUser {
  username: string
  displayName: string
  role: string

  locationName: string
  locationId: string
}

export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean

  login: (
    username: string,
    password: string,
  ) => Promise<boolean>

  logout: () => void
}