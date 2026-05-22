import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { seatService } from '../services/seat.service'
import { useBookingStore } from '../stores/booking.store'

export const BookingLayout = () => {
  useEffect(() => {
    return () => {
      const { selectedTrip, selectedSeats, clearBooking } = useBookingStore.getState()
      if (!selectedTrip || !selectedSeats.length) return

      void (async () => {
        try {
          await seatService.releaseSeats({
            tripId: selectedTrip.id,
            seatIds: selectedSeats.map((seat) => seat.id),
          })
        } finally {
          clearBooking()
        }
      })()
    }
  }, [])

  return <Outlet />
}
