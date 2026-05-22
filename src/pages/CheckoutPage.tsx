import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CreditCard } from 'lucide-react'
import { BookingSummary } from '../components/booking/BookingSummary'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { orderService } from '../services/order.service'
import { useAuthStore } from '../stores/auth.store'
import { useBookingStore } from '../stores/booking.store'
import { PaymentMethod } from '../types/enums'
import { getApiErrorMessage } from '../utils/api-error'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const {
    selectedTrip,
    selectedSeats,
    pickupStop,
    dropoffStop,
    passengerInfo,
    holdExpiresAt,
    setPassengerInfo,
    clearBooking,
  } = useBookingStore()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!selectedTrip || !selectedSeats.length || !pickupStop || !dropoffStop) {
      navigate('/trips/search', { replace: true })
      return
    }
    if (user) {
      setPassengerInfo({
        fullName: passengerInfo.fullName || user.fullName,
        email: passengerInfo.email || user.email,
        phoneNumber: passengerInfo.phoneNumber || user.phoneNumber,
      })
    }
  }, [dropoffStop, navigate, passengerInfo.email, passengerInfo.fullName, passengerInfo.phoneNumber, pickupStop, selectedSeats.length, selectedTrip, setPassengerInfo, user])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedTrip || !pickupStop || !dropoffStop) return
    setSubmitting(true)
    try {
      const response = await orderService.createOrder({
        tripId: selectedTrip.id,
        seatIds: selectedSeats.map((seat) => seat.id),
        fullName: passengerInfo.fullName,
        email: passengerInfo.email,
        phoneNumber: passengerInfo.phoneNumber,
        pickUpRouteStopId: pickupStop.id,
        dropOffRouteStopId: dropoffStop.id,
        paymentMethod: passengerInfo.paymentMethod,
      })

      if (!response.data) throw new Error(response.message || 'Khong tao duoc don hang')
      if (response.data.paymentMethod === PaymentMethod.VNPAY && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl
        return
      }

      toast.success('Tao don hang thanh cong')
      clearBooking()
      navigate('/my-orders')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading compact">
        <span className="eyebrow">Thanh toan</span>
        <h1>Hoan tat thong tin dat ve</h1>
        <p>Ghe duoc giu tam thoi trong 5 phut. Hay hoan tat truoc khi het han.</p>
      </div>

      <div className="detail-grid">
        <form className="panel checkout-form" onSubmit={handleSubmit}>
          {holdExpiresAt ? <div className="notice">Han giu ghe: {new Date(holdExpiresAt).toLocaleTimeString('vi-VN')}</div> : null}
          <Input
            label="Ho ten"
            value={passengerInfo.fullName}
            onChange={(event) => setPassengerInfo({ fullName: event.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={passengerInfo.email}
            onChange={(event) => setPassengerInfo({ email: event.target.value })}
            required
          />
          <Input
            label="So dien thoai"
            value={passengerInfo.phoneNumber}
            onChange={(event) => setPassengerInfo({ phoneNumber: event.target.value })}
            required
          />
          <Select
            label="Phuong thuc thanh toan"
            value={passengerInfo.paymentMethod}
            onChange={(event) => setPassengerInfo({ paymentMethod: event.target.value as PaymentMethod })}
          >
            <option value={PaymentMethod.VNPAY}>VNPAY</option>
            <option value={PaymentMethod.CASH}>Tien mat tai ben</option>
          </Select>
          <div className="form-actions">
            <Button type="submit" disabled={submitting} icon={<CreditCard size={16} />}>
              {submitting ? 'Dang tao don' : 'Tao don hang'}
            </Button>
          </div>
        </form>

        <BookingSummary trip={selectedTrip} seats={selectedSeats} pickupStop={pickupStop} dropoffStop={dropoffStop} />
      </div>
    </section>
  )
}

