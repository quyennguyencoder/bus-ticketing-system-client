import React, { useState, useMemo } from 'react'
import { SeatStatus } from '../../types/enums'
import { SeatResponse } from '../../types/response'
import { Compass, Calendar } from 'lucide-react'

type SeatMapProps = {
  seats: SeatResponse[]
  selectedSeatIds: string[]
  onToggle: (seat: SeatResponse) => void
}

export const SeatMap = ({ seats, selectedSeatIds, onToggle }: SeatMapProps) => {
  const [activeDeckTab, setActiveDeckTab] = useState<'lower' | 'upper'>('lower')

  // Sort seats alphanumeric (e.g. A01, A02, B01...)
  const sortedSeats = useMemo(() => {
    return [...seats].sort((a, b) => 
      a.seatCode.localeCompare(b.seatCode, undefined, { numeric: true, sensitivity: 'base' })
    )
  }, [seats])

  // Partition seats into Lower Deck (starts with A) and Upper Deck (starts with B)
  const { lowerDeck, upperDeck } = useMemo(() => {
    const lower: SeatResponse[] = []
    const upper: SeatResponse[] = []

    const hasLetterPrefix = sortedSeats.some(s => {
      const firstChar = s.seatCode.charAt(0).toUpperCase()
      return isNaN(Number(firstChar))
    })

    if (hasLetterPrefix) {
      sortedSeats.forEach(seat => {
        const firstChar = seat.seatCode.charAt(0).toUpperCase()
        if (firstChar === 'B' || firstChar === 'T') { // B or T for upper
          upper.push(seat)
        } else {
          lower.push(seat)
        }
      })
    } else {
      // Split half-half if no prefix and many seats
      if (sortedSeats.length > 20) {
        const half = Math.ceil(sortedSeats.length / 2)
        lower.push(...sortedSeats.slice(0, half))
        upper.push(...sortedSeats.slice(half))
      } else {
        lower.push(...sortedSeats)
      }
    }
    return { lowerDeck: lower, upperDeck: upper }
  }, [sortedSeats])

  // Split deck seats into rows of 3 columns
  const getRowsOf3 = (deckSeats: SeatResponse[]) => {
    const rows: SeatResponse[][] = []
    for (let i = 0; i < deckSeats.length; i += 3) {
      rows.push(deckSeats.slice(i, i + 3))
    }
    return rows
  }

  const lowerRows = useMemo(() => getRowsOf3(lowerDeck), [lowerDeck])
  const upperRows = useMemo(() => getRowsOf3(upperDeck), [upperDeck])

  const renderSeat = (seat: SeatResponse) => {
    const isSelected = selectedSeatIds.includes(seat.id)
    const isDisabled = seat.status !== SeatStatus.AVAILABLE

    // Elegant inline style attributes matching high-end UI design
    let bgColor = '#f8fafc' // Available
    let borderColor = '#cbd5e1'
    let textColor = '#334155'
    let cursorStyle = 'pointer'
    let shadowStyle = '0 1px 3px rgba(0,0,0,0.05)'

    if (isSelected) {
      bgColor = '#0f766e' // Dark Teal for selected
      borderColor = '#0f766e'
      textColor = '#ffffff'
      shadowStyle = '0 4px 12px rgba(15, 118, 110, 0.3)'
    } else if (seat.status === SeatStatus.SOLD) {
      bgColor = '#fee2e2' // Soft Red for sold
      borderColor = '#fca5a5'
      textColor = '#b91c1c'
      cursorStyle = 'not-allowed'
    } else if (seat.status === SeatStatus.HOLDING) {
      bgColor = '#fffbeb' // Soft Yellow for holding
      borderColor = '#fde047'
      textColor = '#b45309'
      cursorStyle = 'not-allowed'
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isDisabled}
        onClick={() => onToggle(seat)}
        title={`${seat.seatCode} - ${
          seat.status === SeatStatus.AVAILABLE ? 'Ghế trống' : 
          seat.status === SeatStatus.HOLDING ? 'Đang giữ chỗ' : 'Đã bán'
        }`}
        style={{
          aspectRatio: '1',
          width: '100%',
          maxWidth: '56px',
          borderRadius: '12px 12px 6px 6px', // Rounded top representing passenger seat headrest
          border: '2px solid',
          borderColor: borderColor,
          backgroundColor: bgColor,
          color: textColor,
          fontWeight: 800,
          fontSize: '13px',
          cursor: cursorStyle,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: shadowStyle,
          padding: '4px',
          margin: '0 auto',
          outline: 'none'
        }}
        className="seat-button-hover"
      >
        {/* Visual Seat Headrest representation */}
        <div style={{
          width: '60%',
          height: '6px',
          backgroundColor: isSelected ? '#115e59' : seat.status === SeatStatus.SOLD ? '#fca5a5' : seat.status === SeatStatus.HOLDING ? '#fde047' : '#cbd5e1',
          borderRadius: '4px 4px 2px 2px',
          position: 'absolute',
          top: '4px',
          opacity: 0.7
        }} />

        <span style={{ marginTop: '4px', zIndex: 2 }}>{seat.seatCode}</span>
      </button>
    )
  }

  const renderDeckGrid = (rows: SeatResponse[][], isLowerDeck: boolean) => {
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '2px solid #cbd5e1',
        borderRadius: '24px',
        padding: '24px 20px',
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
        boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Front windshield & Dashboard outline (Only shown at front/top of cabin) */}
        <div style={{
          height: '8px',
          backgroundColor: '#334155',
          borderRadius: '12px 12px 0 0',
          margin: '-24px -20px 0 -20px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }} />

        {/* Visual Driver Steering Wheel & Entrance (Only for lower deck) */}
        {isLowerDeck && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '2px dashed #edf2f7',
            color: '#64748b',
            fontSize: '11px',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Compass icon represents Steering wheel */}
              <Compass size={20} style={{ color: '#475569', animation: 'spin 12s linear infinite' }} />
              <span>Tài xế</span>
            </div>
            <span>Cửa lên xuống</span>
          </div>
        )}

        {/* Rows of seats inside bus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rows.map((row, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '16px',
                alignItems: 'center'
              }}
            >
              {/* Seat 1 (Left window) */}
              {row[0] ? renderSeat(row[0]) : <div />}

              {/* Seat 2 (Middle) */}
              {row[1] ? renderSeat(row[1]) : <div />}

              {/* Seat 3 (Right window) */}
              {row[2] ? renderSeat(row[2]) : <div />}
            </div>
          ))}
        </div>

        {/* Rear cabin bumper */}
        <div style={{
          height: '10px',
          backgroundColor: '#cbd5e1',
          borderRadius: '0 0 20px 20px',
          margin: '0 -20px -24px -20px'
        }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      
      {/* Mobile floors/decks tabs selectors (Visible on mobile, hides on large screens) */}
      {upperDeck.length > 0 && (
        <div className="deck-tabs-selector" style={{ 
          display: 'none', 
          justifyContent: 'center', 
          gap: '8px',
          backgroundColor: '#f1f5f9',
          padding: '6px',
          borderRadius: '10px',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveDeckTab('lower')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeDeckTab === 'lower' ? '#fff' : 'transparent',
              color: activeDeckTab === 'lower' ? '#0f766e' : '#64748b',
              boxShadow: activeDeckTab === 'lower' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Tầng Dưới
          </button>
          <button
            type="button"
            onClick={() => setActiveDeckTab('upper')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeDeckTab === 'upper' ? '#fff' : 'transparent',
              color: activeDeckTab === 'upper' ? '#0f766e' : '#64748b',
              boxShadow: activeDeckTab === 'upper' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Tầng Trên
          </button>
        </div>
      )}

      {/* Main Seat Deck Grids (Side-by-side on desktop, toggled/responsive on mobile) */}
      <div className="decks-container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '40px',
        width: '100%',
        padding: '12px 0'
      }}>
        {/* Render Lower Deck (Always shown or if active in mobile tab selector) */}
        <div 
          className="deck-column lower-deck-col"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            alignItems: 'center' 
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            TẦNG DƯỚI (Lower Deck)
          </span>
          {renderDeckGrid(lowerRows, true)}
        </div>

        {/* Render Upper Deck (If available and either desktop or active in mobile tab selector) */}
        {upperDeck.length > 0 && (
          <div 
            className="deck-column upper-deck-col"
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              TẦNG TRÊN (Upper Deck)
            </span>
            {renderDeckGrid(upperRows, false)}
          </div>
        )}
      </div>

      {/* Injecting CSS specifically for the responsive deck container layouts */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .seat-button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.08) !important;
        }
        @media (max-width: 640px) {
          .deck-tabs-selector {
            display: flex !important;
          }
          .decks-container {
            gap: 0 !important;
          }
          .lower-deck-col {
            display: ${activeDeckTab === 'lower' ? 'flex' : 'none'} !important;
          }
          .upper-deck-col {
            display: ${activeDeckTab === 'upper' ? 'flex' : 'none'} !important;
          }
        }
      `}</style>
    </div>
  )
}
