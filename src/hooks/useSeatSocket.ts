import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { SeatStatusUpdateResponse } from '../types/response'
import { useAuthStore } from '../stores/auth.store'
import { useBookingStore } from '../stores/booking.store'

export const useSeatSocket = (tripId?: string) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const updateSeats = useBookingStore((state) => state.updateSeats)

  useEffect(() => {
    if (!tripId) return

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      reconnectDelay: 5000,
      debug: () => undefined,
    })

    client.onConnect = () => {
      client.subscribe(`/topic/trips/${tripId}/seats`, (message) => {
        const payload = JSON.parse(message.body) as SeatStatusUpdateResponse
        const selectedBefore = useBookingStore.getState().selectedSeats.map((seat) => seat.id)
        updateSeats(payload.updatedSeats)
        const selectedAfter = useBookingStore.getState().selectedSeats.map((seat) => seat.id)
        if (selectedAfter.length < selectedBefore.length) {
          toast('Mot ghe ban dang chon vua thay doi trang thai')
        }
      })
    }

    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [accessToken, tripId, updateSeats])
}

