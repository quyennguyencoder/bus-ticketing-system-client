import { axiosInstance } from '../config/axios'
import { ApiResponse } from '../types/common'
import { AuthLoginRequest, AuthLogoutRequest, AuthRefreshTokenRequest, AuthRegisterRequest } from '../types/request'
import { AuthResponse, AuthSocialLoginResponse } from '../types/response'

export const authService = {
  register: async (data: AuthRegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/api/v1/auth/register', data)
    return response.data
  },

  login: async (data: AuthLoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/api/v1/auth/login', data)
    return response.data
  },

  logout: async (data: AuthLogoutRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post('/api/v1/auth/logout', data)
    return response.data
  },

  refresh: async (data: AuthRefreshTokenRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/api/v1/auth/refresh', data)
    return response.data
  },

  socialLogin: async (socialLoginType: string): Promise<ApiResponse<AuthSocialLoginResponse>> => {
    const response = await axiosInstance.get('/api/v1/auth/social-login', { params: { socialLoginType } })
    return response.data
  },

  socialLoginCallback: async (socialLoginType: string, code: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.get('/api/v1/auth/social-login/callback', { params: { socialLoginType, code } })
    return response.data
  },
}
