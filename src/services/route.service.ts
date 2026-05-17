import { axiosInstance } from '../config/axios'
import { ApiResponse, PageResponse } from '../types/common'
import { CreateRouteRequest, UpdateRouteRequest } from '../types/request'
import { RouteResponse } from '../types/response'

export const routeService = {
  getAllRoutes: async (page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<RouteResponse>>> => {
    const response = await axiosInstance.get('/api/v1/routes', { params: { page, size } })
    return response.data
  },

  getRouteById: async (routeId: string): Promise<ApiResponse<RouteResponse>> => {
    const response = await axiosInstance.get(`/api/v1/routes/${routeId}`)
    return response.data
  },

  getRouteByCode: async (code: string): Promise<ApiResponse<RouteResponse>> => {
    const response = await axiosInstance.get(`/api/v1/routes/by-code/${code}`)
    return response.data
  },

  createRoute: async (data: CreateRouteRequest): Promise<ApiResponse<RouteResponse>> => {
    const response = await axiosInstance.post('/api/v1/routes', data)
    return response.data
  },

  updateRoute: async (routeId: string, data: UpdateRouteRequest): Promise<ApiResponse<RouteResponse>> => {
    const response = await axiosInstance.put(`/api/v1/routes/${routeId}`, data)
    return response.data
  },

  deleteRoute: async (routeId: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/v1/routes/${routeId}`)
    return response.data
  },
}
