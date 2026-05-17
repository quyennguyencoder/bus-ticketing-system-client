import { axiosInstance } from '../config/axios'
import { VNPayIpnResponse } from '../types/response'

export const paymentService = {
  handleVNPayIpn: async (params: Record<string, string>): Promise<VNPayIpnResponse> => {
    const response = await axiosInstance.get('/api/v1/payments/vnpay/ipn', { params })
    return response.data
  },
}
