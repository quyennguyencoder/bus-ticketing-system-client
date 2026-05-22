import { create } from 'zustand'
import { AuthLoginRequest, AuthRegisterRequest } from '../types/request'
import { UserResponse } from '../types/response'
import { authService } from '../services/auth.service'

const STORAGE_KEY = 'bus-ticketing-auth'

type PersistedAuth = {
  accessToken: string
  refreshToken: string
  user: UserResponse
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setAuth: (auth: PersistedAuth) => void
  login: (data: AuthLoginRequest) => Promise<void>
  register: (data: AuthRegisterRequest) => Promise<void>
  logout: () => Promise<void>
  clearAuth: () => void
  hydrate: () => void
}

const readStoredAuth = (): PersistedAuth | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedAuth) : null
  } catch {
    return null
  }
}

const persistAuth = (auth: PersistedAuth) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

const removeAuth = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (auth) => {
    persistAuth(auth)
    set({ ...auth, isAuthenticated: true })
  },

  login: async (data) => {
    const response = await authService.login(data)
    if (!response.data) throw new Error(response.message || 'Dang nhap that bai')
    get().setAuth(response.data)
  },

  register: async (data) => {
    const response = await authService.register(data)
    if (!response.data) throw new Error(response.message || 'Dang ky that bai')
    get().setAuth(response.data)
  },

  logout: async () => {
    const refreshToken = get().refreshToken
    try {
      if (refreshToken) await authService.logout({ refreshToken })
    } finally {
      get().clearAuth()
    }
  },

  clearAuth: () => {
    removeAuth()
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false })
  },

  hydrate: () => {
    const stored = readStoredAuth()
    if (stored?.accessToken && stored.refreshToken && stored.user) {
      set({ ...stored, isAuthenticated: true })
    }
  },
}))

useAuthStore.getState().hydrate()

