import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import { TripCard } from '../components/booking/TripCard'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { pointService } from '../services/point.service'
import { tripService } from '../services/trip.service'
import { PointResponse, TripResponse } from '../types/response'
import { getApiErrorMessage } from '../utils/api-error'
import { useBookingStore } from '../stores/booking.store'

const today = new Date().toISOString().slice(0, 10)

export const TripSearchPage = () => {
  const navigate = useNavigate()
  const setSelectedTrip = useBookingStore((state) => state.setSelectedTrip)
  const [points, setPoints] = useState<PointResponse[]>([])
  const [trips, setTrips] = useState<TripResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState({
    provinceFromCode: '79',
    provinceToCode: '56',
    // departureDate: today,
    departureDate: "2026-06-20",
    sortByPrice: 'ASC',
    sortByTime: 'ASC',
  })

  const provinces = useMemo(() => {
    const map = new Map<string, string>()
    points.forEach((point) => map.set(point.provinceCode, point.provinceName))
    return [...map.entries()].map(([code, name]) => ({ code, name }))
  }, [points])

  useEffect(() => {
    pointService
      .getAllPoints(0, 100)
      .then((response) => setPoints(response.data?.content || []))
      .catch((error) => toast.error(getApiErrorMessage(error)))
      .finally(() => setInitialLoading(false))
  }, [])

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault()
    setLoading(true)
    try {
      const response = await tripService.searchTrips(
        form.provinceFromCode,
        form.provinceToCode,
        form.departureDate,
        0,
        20,
        form.sortByPrice,
        form.sortByTime,
      )
      setTrips(response.data?.content || [])
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialLoading) void Promise.resolve().then(() => handleSearch())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoading])

  return (
    <section className="page-stack">
      <div className="page-heading">
        <span className="eyebrow">Dat ve xe</span>
        <h1>Tim chuyen phu hop</h1>
        <p>Chon diem di, diem den va ngay khoi hanh de xem cac chuyen dang mo ban.</p>
      </div>

      <form className="search-panel" onSubmit={handleSearch}>
        <Select
          label="Diem di"
          value={form.provinceFromCode}
          onChange={(event) => setForm({ ...form, provinceFromCode: event.target.value })}
        >
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </Select>
        <Select
          label="Diem den"
          value={form.provinceToCode}
          onChange={(event) => setForm({ ...form, provinceToCode: event.target.value })}
        >
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </Select>
        <Input
          label="Ngay di"
          type="date"
          min={today}
          value={form.departureDate}
          onChange={(event) => setForm({ ...form, departureDate: event.target.value })}
        />
        <Select
          label="Sap xep gia"
          value={form.sortByPrice}
          onChange={(event) => setForm({ ...form, sortByPrice: event.target.value })}
        >
          <option value="ASC">Gia thap truoc</option>
          <option value="DESC">Gia cao truoc</option>
        </Select>
        <Button type="submit" disabled={loading || initialLoading} icon={<Search size={16} />}>
          Tim chuyen
        </Button>
      </form>

      {loading || initialLoading ? <Spinner label="Dang tim chuyen" /> : null}
      {!loading && !initialLoading && trips.length === 0 ? (
        <EmptyState title="Chua co chuyen phu hop">Thu doi ngay khoi hanh hoac diem den khac.</EmptyState>
      ) : null}
      <div className="trip-list">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onSelect={() => {
              setSelectedTrip(trip)
              navigate(`/trips/${trip.id}`)
            }}
          />
        ))}
      </div>
    </section>
  )
}
