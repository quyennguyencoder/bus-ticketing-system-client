import { axiosInstance } from '../config/axios'
import { ApiResponse } from '../types/common';
import {
  StatisticRevenueResponse,
  StatisticOrderStatusResponse,
  StatisticPaymentMethodResponse,
  StatisticTopRouteResponse,
  StatisticTripOccupancyResponse,
  StatisticUserGrowthResponse,
} from '../types/response/statistic';

export const statisticService = {
  getRevenue: async (startDate: string, endDate: string): Promise<ApiResponse<StatisticRevenueResponse[]>> => {
    const response = await axiosInstance.get('/api/v1/statistics/revenue', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getOrderStatusDistribution: async (startDate: string, endDate: string): Promise<ApiResponse<StatisticOrderStatusResponse[]>> => {
    const response = await axiosInstance.get('/api/v1/statistics/orders/status', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getRevenueByPaymentMethod: async (startDate: string, endDate: string): Promise<ApiResponse<StatisticPaymentMethodResponse[]>> => {
    const response = await axiosInstance.get('/api/v1/statistics/revenue/by-payment-method', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getTopRoutes: async (startDate: string, endDate: string, limit: number = 5): Promise<ApiResponse<StatisticTopRouteResponse[]>> => {
    const response = await axiosInstance.get('/api/v1/statistics/routes/top-performers', {
      params: { startDate, endDate, limit },
    });
    return response.data;
  },

  getTripOccupancy: async (startDate: string, endDate: string): Promise<ApiResponse<StatisticTripOccupancyResponse[]>> => {
    const response = await axiosInstance.get('/api/v1/statistics/trips/occupancy', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getUserGrowth: async (startDate: string, endDate: string): Promise<ApiResponse<StatisticUserGrowthResponse[]>> => {
    const response = await axiosInstance.get('/api/v1/statistics/users/growth', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
