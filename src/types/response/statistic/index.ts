export interface StatisticRevenueResponse {
  date: string;
  revenue: number;
}

export interface StatisticOrderStatusResponse {
  status: string;
  count: number;
}

export interface StatisticPaymentMethodResponse {
  paymentMethod: string;
  totalAmount: number;
  percentage: number;
}

export interface StatisticTopRouteResponse {
  routeCode: string;
  routeName: string;
  bookingCount: number;
  revenue: number;
}

export interface StatisticTripOccupancyResponse {
  routeName: string;
  occupancyRate: number;
  totalSeats: number;
  bookedSeats: number;
}

export interface StatisticUserGrowthResponse {
  period: string;
  newUsers: number;
}
