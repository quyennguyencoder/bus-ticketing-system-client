import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import { TripCard } from '../components/booking/TripCard'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { tripService } from '../services/trip.service'
import { TripResponse } from '../types/response'
import { getApiErrorMessage } from '../utils/api-error'
import provincesData from '../assets/provinces.json'
import { useBookingStore } from '../stores/booking.store'
import searchBg from '../assets/search_bg.png'

//const today = new Date().toISOString().slice(0, 10)
const today = "2026-06-01"

export const TripSearchPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSelectedTrip = useBookingStore((state) => state.setSelectedTrip)
  const [trips, setTrips] = useState<TripResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [form, setForm] = useState({
    provinceFromCode: searchParams.get('from') || '30',
    provinceToCode: searchParams.get('to') || '43',
    departureDate: searchParams.get('date') || today,
    sortOption: 'DEFAULT',
  })

  useEffect(() => {
    // Just to keep the initial loading cycle if needed
    setInitialLoading(false)
  }, [])

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault()
    setLoading(true)
    let sortByPrice = ''
    let sortByTime = ''
    if (form.sortOption === 'PRICE_ASC') {
      sortByPrice = 'ASC'
    } else if (form.sortOption === 'PRICE_DESC') {
      sortByPrice = 'DESC'
    } else if (form.sortOption === 'TIME_ASC') {
      sortByTime = 'ASC'
    } else if (form.sortOption === 'TIME_DESC') {
      sortByTime = 'DESC'
    }

    try {
      const response = await tripService.searchTrips(
        form.provinceFromCode,
        form.provinceToCode,
        form.departureDate,
        0,
        20,
        sortByPrice,
        sortByTime,
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
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.75), rgba(248, 250, 252, 0.9)), url(${searchBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      <section className="page-stack" style={{ maxWidth: '1000px', margin: '100px auto 40px', padding: '0 24px' }}>
        <div className="page-heading">
          <span className="eyebrow">Dat ve xe</span>
          <h1>Tim chuyen phu hop</h1>
          <p>Chon diem di, diem den va ngay khoi hanh de xem cac chuyen dang mo ban.</p>
        </div>

        <form className="search-panel" onSubmit={handleSearch} style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', borderRadius: '16px' }}>
          <Select
            label="Diem di"
            value={form.provinceFromCode}
            onChange={(event) => setForm({ ...form, provinceFromCode: event.target.value })}
          >
            {provincesData.map((province) => (
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
            {provincesData.map((province) => (
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
            label="Sap xep theo"
            value={form.sortOption}
            onChange={(event) => setForm({ ...form, sortOption: event.target.value })}
          >
            <option value="DEFAULT">Mac dinh</option>
            <option value="PRICE_ASC">Gia tang dan</option>
            <option value="PRICE_DESC">Gia giam dan</option>
            <option value="TIME_ASC">Gio di tang dan</option>
            <option value="TIME_DESC">Gio di giam dan</option>
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
    </>
  )
}
