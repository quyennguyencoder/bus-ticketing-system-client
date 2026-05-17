import { axiosInstance } from '../config/axios'
import { ApiResponse } from '../types/common'
import { CreateSeatRequest, HoldSeatsRequest, ReleaseSeatsRequest } from '../types/request'
import { SeatResponse } from '../types/response'

export const seatService = {
  holdSeats: async (data: HoldSeatsRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post('/api/v1/seats/hold', data)
    return response.data
  },

  releaseSeats: async (data: ReleaseSeatsRequest): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post('/api/v1/seats/release', data)
    return response.data
  },

  getSeatById: async (seatId: string): Promise<ApiResponse<SeatResponse>> => {
    const response = await axiosInstance.get(`/api/v1/seats/${seatId}`)
    return response.data
  },

  getSeatsByTrip: async (tripId: string): Promise<ApiResponse<SeatResponse[]>> => {
    const response = await axiosInstance.get(`/api/v1/seats/by-trip/${tripId}`)
    return response.data
  },

  createSeat: async (data: CreateSeatRequest): Promise<ApiResponse<SeatResponse>> => {
    const response = await axiosInstance.post('/api/v1/seats', data)
    return response.data
  },

  updateSeatStatus: async (seatId: string, status: string): Promise<ApiResponse<SeatResponse>> => {
    const response = await axiosInstance.patch(`/api/v1/seats/${seatId}/status`, null, { params: { status } })
    return response.data
  },

  deleteSeat: async (seatId: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/v1/seats/${seatId}`)
    return response.data
  },
}
