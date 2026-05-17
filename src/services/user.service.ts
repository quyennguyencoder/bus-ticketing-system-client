import { axiosInstance } from '../config/axios'
import { ApiResponse, PageResponse } from '../types/common'
import { UserUpdatePasswordRequest, UserUpdateRequest } from '../types/request'
import { UserResponse } from '../types/response'

export const userService = {
  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.get('/api/v1/users/me')
    return response.data
  },

  getUserById: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.get(`/api/v1/users/${userId}`)
    return response.data
  },

  updateUserProfile: async (userId: string, data: UserUpdateRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.put(`/api/v1/users/${userId}`, data)
    return response.data
  },

  changePassword: async (userId: string, data: UserUpdatePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.put(`/api/v1/users/${userId}/change-password`, data)
    return response.data
  },

  getAllUsers: async (page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<UserResponse>>> => {
    const response = await axiosInstance.get('/api/v1/users', { params: { page, size } })
    return response.data
  },

  changeUserStatus: async (userId: string, status: string): Promise<ApiResponse<UserResponse>> => {
    const response = await axiosInstance.patch(`/api/v1/users/${userId}/change-status`, null, { params: { status } })
    return response.data
  },

  uploadAvatar: async (userId: string, file: File): Promise<ApiResponse<UserResponse>> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosInstance.post(`/api/v1/users/${userId}/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
