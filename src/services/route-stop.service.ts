import { axiosInstance } from '../config/axios'
import { ApiResponse } from '../types/common'
import { CreateRouteStopRequest, UpdateRouteStopRequest } from '../types/request'
import { RouteStopResponse } from '../types/response'

export const routeStopService = {
  getRouteStopById: async (routeStopId: string): Promise<ApiResponse<RouteStopResponse>> => {
    const response = await axiosInstance.get(`/api/v1/route-stops/${routeStopId}`)
    return response.data
  },

  getRouteStopsByRoute: async (routeId: string): Promise<ApiResponse<RouteStopResponse[]>> => {
    const response = await axiosInstance.get(`/api/v1/route-stops/by-route/${routeId}`)
    return response.data
  },

  createRouteStop: async (data: CreateRouteStopRequest): Promise<ApiResponse<RouteStopResponse>> => {
    const response = await axiosInstance.post('/api/v1/route-stops', data)
    return response.data
  },

  updateRouteStop: async (routeStopId: string, data: UpdateRouteStopRequest): Promise<ApiResponse<RouteStopResponse>> => {
    const response = await axiosInstance.put(`/api/v1/route-stops/${routeStopId}`, data)
    return response.data
  },

  deleteRouteStop: async (routeStopId: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/v1/route-stops/${routeStopId}`)
    return response.data
  },
}
