import { axiosInstance } from '../config/axios'
import { ApiResponse, PageResponse } from '../types/common'
import { CreateTripRequest, UpdateTripRequest } from '../types/request'
import { RouteStopResponse, SeatResponse, TripResponse } from '../types/response'

export const tripService = {
  searchTrips: async (
    provinceFromCode: string,
    provinceToCode: string,
    departureDate: string,
    page: number = 0,
    size: number = 10,
    sortByPrice: string = 'ASC',
    sortByTime: string = 'ASC'
  ): Promise<ApiResponse<PageResponse<TripResponse>>> => {
    const response = await axiosInstance.get('/api/v1/trips/search', {
      params: { provinceFromCode, provinceToCode, departureDate, page, size, sortByPrice, sortByTime },
    })
    return response.data
  },

  getSeatsByTrip: async (tripId: string): Promise<ApiResponse<SeatResponse[]>> => {
    const response = await axiosInstance.get(`/api/v1/trips/${tripId}/seats`)
    return response.data
  },

  getRouteStopsByTrip: async (tripId: string): Promise<ApiResponse<RouteStopResponse[]>> => {
    const response = await axiosInstance.get(`/api/v1/trips/${tripId}/route-stops`)
    return response.data
  },

  getAllTrips: async (page: number = 0, size: number = 10, status?: string): Promise<ApiResponse<PageResponse<TripResponse>>> => {
    const response = await axiosInstance.get('/api/v1/trips', { params: { page, size, status } })
    return response.data
  },

  getTripById: async (tripId: string): Promise<ApiResponse<TripResponse>> => {
    const response = await axiosInstance.get(`/api/v1/trips/${tripId}`)
    return response.data
  },

  createTrip: async (data: CreateTripRequest): Promise<ApiResponse<TripResponse>> => {
    const response = await axiosInstance.post('/api/v1/trips', data)
    return response.data
  },

  updateTrip: async (tripId: string, data: UpdateTripRequest): Promise<ApiResponse<TripResponse>> => {
    const response = await axiosInstance.put(`/api/v1/trips/${tripId}`, data)
    return response.data
  },

  updateTripStatus: async (tripId: string, status: string): Promise<ApiResponse<TripResponse>> => {
    const response = await axiosInstance.patch(`/api/v1/trips/${tripId}/status`, null, { params: { status } })
    return response.data
  },

  deleteTrip: async (tripId: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete(`/api/v1/trips/${tripId}`)
    return response.data
  },
}
