import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RouteStopSelect } from '../components/booking/RouteStopSelect'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { tripService } from '../services/trip.service'
import { useBookingStore } from '../stores/booking.store'
import { getApiErrorMessage } from '../utils/api-error'

export const TripStopsPage = () => {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { 
    selectedTrip,
    routeStops, 
    pickupStop, 
    dropoffStop, 
    setRouteStops, 
    setPickupStop, 
    setDropoffStop,
    setSelectedTrip
  } = useBookingStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tripId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [stopsRes, tripRes] = await Promise.all([
          routeStops.length ? Promise.resolve({ data: routeStops }) : tripService.getRouteStopsByTrip(tripId),
          selectedTrip ? Promise.resolve({ data: selectedTrip }) : tripService.getTripById(tripId)
        ])

        if (stopsRes.data) setRouteStops(stopsRes.data)
        if (tripRes.data) setSelectedTrip(tripRes.data)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tripId, routeStops.length, selectedTrip, setRouteStops, setSelectedTrip])

  const pickupStops = useMemo(() => routeStops.filter((stop) => stop.isPickUp), [routeStops])
  const dropoffStops = useMemo(() => routeStops.filter((stop) => stop.isDropOff), [routeStops])

  // Sort route stops by orderIndex to display the timeline correctly
  const sortedStops = useMemo(() => {
    return [...routeStops].sort((a, b) => a.orderIndex - b.orderIndex)
  }, [routeStops])

  const handleConfirm = () => {
    if (!pickupStop || !dropoffStop) return
    navigate('/checkout')
  }

  // Format the stop time relative to base departure time
  const formatStopRelativeTime = (baseDepartureTimeStr: string, timeOffsetMinutes: number) => {
    try {
      const baseTime = new Date(baseDepartureTimeStr)
      if (isNaN(baseTime.getTime())) return ''
      
      const stopTime = new Date(baseTime.getTime() + timeOffsetMinutes * 60 * 1000)
      
      const hours = String(stopTime.getHours()).padStart(2, '0')
      const minutes = String(stopTime.getMinutes()).padStart(2, '0')
      const day = String(stopTime.getDate()).padStart(2, '0')
      const month = String(stopTime.getMonth() + 1).padStart(2, '0')
      
      return `${hours}:${minutes} (${day}/${month})`
    } catch {
      return ''
    }
  }

  if (loading) return <Spinner label="Dang tai diem don/tra va lo trinh" />
  if (error) return <ErrorState message={error} />

  return (
    <section className="page-stack">
      <div className="page-heading compact">
        <span className="eyebrow">Chon diem don/tra</span>
        <h1>Lua chon diem don va diem tra</h1>
      </div>

      <div className="panel two-cols">
        <RouteStopSelect label="Diem don" stops={pickupStops} value={pickupStop?.id} onChange={setPickupStop} />
        <RouteStopSelect label="Diem tra" stops={dropoffStops} value={dropoffStop?.id} onChange={setDropoffStop} />
      </div>

      {/* Visual Timeline and Schedule */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#1e293b' }}>
          Lộ trình & Thời gian dự kiến của chuyến xe
        </h3>
        
        {selectedTrip && sortedStops.length > 0 ? (
          <div style={{ position: 'relative', paddingLeft: '32px', margin: '8px 0' }}>
            {/* Timeline vertical bar */}
            <div 
              style={{ 
                position: 'absolute', 
                left: '11px', 
                top: '12px', 
                bottom: '12px', 
                width: '3px', 
                background: 'linear-gradient(180deg, #3b82f6 0%, #10b981 100%)',
                borderRadius: '2px'
              }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {sortedStops.map((stop) => {
                const isFirst = stop.orderIndex === 1
                const stopTimeStr = formatStopRelativeTime(selectedTrip.departureTime, stop.timeOffsetMinutes)
                const isSelectedPickup = pickupStop?.id === stop.id
                const isSelectedDropoff = dropoffStop?.id === stop.id
                
                // Color node based on selection or start/end
                let nodeBg = '#cbd5e1'
                let nodeBorder = '3px solid #f1f5f9'

                if (isSelectedPickup) {
                  nodeBg = '#3b82f6'
                  nodeBorder = '3px solid #dbeafe'
                } else if (isSelectedDropoff) {
                  nodeBg = '#10b981'
                  nodeBorder = '3px solid #d1fae5'
                } else if (isFirst) {
                  nodeBg = '#2563eb'
                  nodeBorder = '3px solid #eff6ff'
                }

                return (
                  <div key={stop.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
                    {/* Node circle */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        left: '-29px', 
                        top: '4px', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        backgroundColor: nodeBg, 
                        border: nodeBorder,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        zIndex: 2,
                        transition: 'all 0.3s ease'
                      }}
                    />

                    {/* Timeline content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>
                          {stop.pointName}
                        </span>
                        
                        {/* Time Badge */}
                        <span 
                          style={{ 
                            fontSize: '12px', 
                            fontWeight: 500, 
                            color: isFirst ? '#2563eb' : '#475569',
                            backgroundColor: isFirst ? '#eff6ff' : '#f1f5f9',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: isFirst ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
                          }}
                        >
                          {isFirst ? `Khởi hành: ${stopTimeStr}` : stopTimeStr}
                        </span>

                        {/* Location Badge */}
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          ({stop.provinceName})
                        </span>

                        {/* Selection Badges */}
                        {isSelectedPickup && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>
                            Điểm đón đã chọn
                          </span>
                        )}
                        {isSelectedDropoff && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                            Điểm trả đã chọn
                          </span>
                        )}
                      </div>

                      {/* Capabilities indicators */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {stop.isPickUp && (
                          <span style={{ fontSize: '11px', color: '#475569', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                            Có đón khách
                          </span>
                        )}
                        {stop.isDropOff && (
                          <span style={{ fontSize: '11px', color: '#475569', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                            Có trả khách
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', margin: 0 }}>
            Không có thông tin lộ trình.
          </p>
        )}
      </div>

      <div className="panel-actions">
        <Button variant="secondary" onClick={() => navigate(`/trips/${tripId}`)}>
          Quay lai
        </Button>
        <Button onClick={handleConfirm} disabled={!pickupStop || !dropoffStop}>
          Xac nhan
        </Button>
      </div>
    </section>
  )
}
