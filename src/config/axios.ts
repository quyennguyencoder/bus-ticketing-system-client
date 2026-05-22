import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'
import { ApiResponse } from '../types/common'
import { AuthResponse } from '../types/response'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

const flushRefreshQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token))
  refreshQueue = []
}

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint = originalRequest?.url?.includes('/api/v1/auth/')

    if (error.response?.status !== 401 || originalRequest?._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) {
      useAuthStore.getState().clearAuth()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error)
            return
          }
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(axiosInstance(originalRequest))
        })
      })
    }

    isRefreshing = true
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(`${baseURL}/api/v1/auth/refresh`, {
        refreshToken,
      })
      if (!response.data.data) throw new Error(response.data.message || 'Khong the lam moi phien dang nhap')
      useAuthStore.getState().setAuth(response.data.data)
      flushRefreshQueue(response.data.data.accessToken)
      originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      flushRefreshQueue(null)
      useAuthStore.getState().clearAuth()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
