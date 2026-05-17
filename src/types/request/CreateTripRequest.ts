export interface CreateTripRequest {
  routeId: string
  busPlate: string
  busType: string
  departureTime: string // ISO-8601 DateTime string
  arrivalTime: string // ISO-8601 DateTime string
  basePrice: number
  price: number
}
