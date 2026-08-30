import { useState } from 'react'

import type { ReactNode } from 'react'
import type { AuthUser } from './auth.types'

import { AuthContext } from './auth-context'

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null)

async function login(
  username: string,
  password: string,
): Promise<boolean> {
  try {
    console.log(
      'Starting login for:',
      username,
    )

    if (!window.api) {
      console.error(
        'window.api is undefined',
      )

      return false
    }

    if (!window.api.auth) {
      console.error(
        'window.api.auth is undefined',
      )

      return false
    }

    if (!window.api.auth.login) {
      console.error(
        'window.api.auth.login is undefined',
      )

      return false
    }

    const result =
      await window.api.auth.login(
        username.trim(),
        password,
      )

    console.log(
      'Login result:',
      result,
    )

    if (
      !result.success ||
      !result.user
    ) {
      return false
    }

   setUser({
  username:
    result.user.username,

  displayName:
    result.user.displayName,

  role:
    result.user.role,

  locationName:
    result.user.locationName,

  locationId:
    result.user.locationId,
})

return true
  } catch (error) {
    console.error(
      'Authentication error:',
      error,
    )

    return false
  }
}

function logout() {
  setUser(null)
}

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider