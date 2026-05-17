import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserResponse } from '../types/response'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  setAuth: (accessToken: string, refreshToken: string, user: UserResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
