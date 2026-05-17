import { TripStatus } from '../enums'

export interface TripResponse {
  id: string
  routeId: string
  routeCode: string
  routeName: string
  busPlate: string
  busType: string
  departureTime: string // ISO-8601 DateTime string
  arrivalTime: string // ISO-8601 DateTime string
  basePrice: number
  price: number
  status: TripStatus
  availableSeatCount: number
}
