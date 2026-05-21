import { PaymentMethod, SeatStatus } from '../types/enums'
import { RouteStopResponse, SeatResponse, TripResponse } from '../types/response'

export type PassengerInfo = {
  fullName: string
  email: string
  phoneNumber: string
  paymentMethod: PaymentMethod
}

import { create } from 'zustand'

type BookingState = {
  selectedTrip: TripResponse | null
  seats: SeatResponse[]
  selectedSeats: SeatResponse[]
  routeStops: RouteStopResponse[]
  pickupStop: RouteStopResponse | null
  dropoffStop: RouteStopResponse | null
  passengerInfo: PassengerInfo
  holdExpiresAt: string | null
  setSelectedTrip: (trip: TripResponse | null) => void
  setSeats: (seats: SeatResponse[]) => void
  updateSeats: (updatedSeats: SeatResponse[]) => void
  toggleSeat: (seat: SeatResponse) => void
  clearSelectedSeats: () => void
  setRouteStops: (stops: RouteStopResponse[]) => void
  setPickupStop: (stop: RouteStopResponse | null) => void
  setDropoffStop: (stop: RouteStopResponse | null) => void
  setPassengerInfo: (info: Partial<PassengerInfo>) => void
  setHoldExpiresAt: (value: string | null) => void
  clearBooking: () => void
}

const defaultPassengerInfo: PassengerInfo = {
  fullName: '',
  email: '',
  phoneNumber: '',
  paymentMethod: PaymentMethod.VNPAY,
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedTrip: null,
  seats: [],
  selectedSeats: [],
  routeStops: [],
  pickupStop: null,
  dropoffStop: null,
  passengerInfo: defaultPassengerInfo,
  holdExpiresAt: null,

  setSelectedTrip: (trip) => set({ selectedTrip: trip }),
  setSeats: (seats) => set({ seats }),
  updateSeats: (updatedSeats) =>
    set((state) => {
      const updatedMap = new Map(updatedSeats.map((seat) => [seat.id, seat]))
      const seats = state.seats.map((seat) => updatedMap.get(seat.id) || seat)
      const selectedSeats = state.selectedSeats.filter((seat) => {
        const updated = updatedMap.get(seat.id)
        return !updated || updated.status !== SeatStatus.SOLD
      })
      return { seats, selectedSeats }
    }),
  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.some((item) => item.id === seat.id)
      return {
        selectedSeats: exists
          ? state.selectedSeats.filter((item) => item.id !== seat.id)
          : [...state.selectedSeats, seat],
      }
    }),
  clearSelectedSeats: () => set({ selectedSeats: [] }),
  setRouteStops: (routeStops) => set({ routeStops }),
  setPickupStop: (pickupStop) => set({ pickupStop }),
  setDropoffStop: (dropoffStop) => set({ dropoffStop }),
  setPassengerInfo: (info) =>
    set((state) => ({ passengerInfo: { ...state.passengerInfo, ...info } })),
  setHoldExpiresAt: (holdExpiresAt) => set({ holdExpiresAt }),
  clearBooking: () =>
    set({
      selectedTrip: null,
      seats: [],
      selectedSeats: [],
      routeStops: [],
      pickupStop: null,
      dropoffStop: null,
      passengerInfo: defaultPassengerInfo,
      holdExpiresAt: null,
    }),
}))

