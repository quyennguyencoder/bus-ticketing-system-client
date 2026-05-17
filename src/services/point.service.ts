import { axiosInstance } from '../config/axios'
import { ApiResponse, PageResponse } from '../types/common'
import { CreatePointRequest, UpdatePointRequest } from '../types/request'
import { PointResponse } from '../types/response'

export const pointService = {
  getAllPoints: async (page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<PointResponse>>> => {
    const response = await axiosInstance.get('/api/v1/points', { params: { page, size } })
    return response.data
  },

  getPointById: async (pointId: string): Promise<ApiResponse<PointResponse>> => {
    const response = await axiosInstance.get(`/api/v1/points/${pointId}`)
    return response.data
  },

  getPointsByProvince: async (provinceCode: string): Promise<ApiResponse<PointResponse[]>> => {
    const response = await axiosInstance.get(`/api/v1/points/by-province/${provinceCode}`)
    return response.data
  },

  createPoint: async (data: CreatePointRequest): Promise<ApiResponse<PointResponse>> => {
    const response = await axiosInstance.post('/api/v1/points', data)
    return response.data
  },

  updatePoint: async (pointId: string, data: UpdatePointRequest): Promise<ApiResponse<PointResponse>> => {
    const response = await axiosInstance.put(`/api/v1/points/${pointId}`, data)
    return response.data
  },

  deletePoint: async (pointId: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/v1/points/${pointId}`)
    return response.data
  },
}
