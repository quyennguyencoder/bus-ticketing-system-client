import { axiosInstance } from '../config/axios'
import { ApiResponse, PageResponse } from '../types/common'
import { CreateOrderRequest } from '../types/request'
import { OrderResponse } from '../types/response'

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    const response = await axiosInstance.post('/api/v1/orders', data)
    return response.data
  },

  getAllOrders: async (page: number = 0, size: number = 10, status?: string): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
    const response = await axiosInstance.get('/api/v1/orders', { params: { page, size, status } })
    return response.data
  },

  getMyOrders: async (page: number = 0, size: number = 10, status?: string): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
    const response = await axiosInstance.get('/api/v1/orders/my-orders', { params: { page, size, status } })
    return response.data
  },

  getOrderById: async (id: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await axiosInstance.get(`/api/v1/orders/${id}`)
    return response.data
  },

  confirmCashPayment: async (id: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await axiosInstance.put(`/api/v1/orders/${id}/pay`)
    return response.data
  },

  cancelOrder: async (id: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await axiosInstance.put(`/api/v1/orders/${id}/cancel`)
    return response.data
  },
}
