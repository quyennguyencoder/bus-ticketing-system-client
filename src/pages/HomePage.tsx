import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BusFront, ShieldCheck, Ticket, Search, Clock, CreditCard, RefreshCw, PhoneCall, CheckCircle } from 'lucide-react'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import provincesData from '../assets/provinces.json'
import bus1 from '../assets/bus_journey_1.png'
import bus2 from '../assets/bus_journey_2.png'
import bus3 from '../assets/bus_journey_3.png'
import featuresBg from '../assets/features_bg.png'
import policiesBg from '../assets/policies_bg.png'
import { useAuthStore } from '../stores/auth.store'

// const today = new Date().toISOString().slice(0, 10)
const today = "2026-06-01"
const images = [bus1, bus2, bus3]

export const HomePage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [form, setForm] = useState({
    provinceFromCode: '30',
    provinceToCode: '43',
    departureDate: today,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({
      from: form.provinceFromCode,
      to: form.provinceToCode,
      date: form.departureDate,
    })
    navigate(`/trips/search?${params.toString()}`)
  }

  return (
    <div className="home-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <section
        className="home-hero"
        style={{
          position: 'relative',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8)), url(${images[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
          color: 'white',
          minHeight: 'calc(100svh - 76px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          marginTop: '-34px',
          paddingTop: '120px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <div className="home-hero__content" style={{ zIndex: 1, width: '100%', maxWidth: '1000px', textAlign: 'left' }}>
          <span className="eyebrow" style={{ color: '#7eeadf', fontSize: '14px', letterSpacing: '0.1em' }}>BusTicket</span>
          <h1 style={{ color: 'white', marginTop: '12px', marginBottom: '24px', fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: '1.2', maxWidth: '800px' }}>
            Đặt vé xe khách nhanh chóng, an toàn và tiện lợi
          </h1>
          <p style={{ color: '#cbd5e1', marginBottom: '40px', fontSize: '18px', maxWidth: '600px', lineHeight: '1.6' }}>
            Trải nghiệm dịch vụ đặt vé hàng đầu với các chuyến đi tiện nghi, thời gian linh hoạt và hỗ trợ 24/7. Khởi hành ngay hôm nay!
          </p>

          <form
            onSubmit={handleSearch}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'end',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '40px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'grid', gap: '8px' }}>
              <Select
                label="Điểm đi"
                value={form.provinceFromCode}
                onChange={(event) => setForm({ ...form, provinceFromCode: event.target.value })}
              >
                {provincesData.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              <Select
                label="Điểm đến"
                value={form.provinceToCode}
                onChange={(event) => setForm({ ...form, provinceToCode: event.target.value })}
              >
                {provincesData.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </Select>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              <Input
                label="Ngày đi"
                type="date"
                min={today}
                value={form.departureDate}
                onChange={(event) => setForm({ ...form, departureDate: event.target.value })}
              />
            </div>
            <Button type="submit" icon={<Search size={16} />} style={{ minHeight: '43px' }}>
              Tìm chuyến
            </Button>
          </form>

          {!isAuthenticated && (
            <div className="home-hero__actions" style={{ marginBottom: '48px' }}>
              <Link to="/login" className="btn btn-secondary home-hero__button" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderColor: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
                <Ticket size={16} />
                Đăng nhập để đặt vé
              </Link>
            </div>
          )}

          <div className="home-hero__stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <article style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
              <BusFront size={28} style={{ color: '#7eeadf' }} />
              <strong style={{ color: 'white' }}>200+</strong>
              <span style={{ color: '#94a3b8' }}>Chuyến xe khởi hành mỗi ngày</span>
            </article>
            <article style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
              <Ticket size={28} style={{ color: '#7eeadf' }} />
              <strong style={{ color: 'white' }}>99%</strong>
              <span style={{ color: '#94a3b8' }}>Khách hàng hài lòng với dịch vụ</span>
            </article>
            <article style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
              <ShieldCheck size={28} style={{ color: '#7eeadf' }} />
              <strong style={{ color: 'white' }}>An toàn tuyệt đối</strong>
              <span style={{ color: '#94a3b8' }}>Thanh toán bảo mật, giữ chỗ 100%</span>
            </article>
          </div>
        </div>
      </section>

      <section className="features-section" style={{
        backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.95)), url(${featuresBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '64px 32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '16px', fontWeight: '800' }}>Vì sao nên chọn BusTicket?</h2>
          <p style={{ color: '#475569', fontSize: '16px', maxWidth: '600px', margin: '0 auto', fontWeight: '500' }}>Chúng tôi không ngừng nâng cao chất lượng dịch vụ để mang đến cho bạn những chuyến đi an toàn và thoải mái nhất.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'white', boxShadow: '0 8px 16px rgba(13, 148, 136, 0.25)' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a', fontWeight: '700' }}>Đúng giờ, linh hoạt</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Lịch trình được tối ưu và cập nhật liên tục, đảm bảo khởi hành đúng giờ với đa dạng khung giờ trong ngày.</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'white', boxShadow: '0 8px 16px rgba(2, 132, 199, 0.25)' }}>
              <CreditCard size={28} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a', fontWeight: '700' }}>Thanh toán đa dạng</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Hỗ trợ nhiều phương thức thanh toán an toàn, từ thẻ tín dụng, ví điện tử đến chuyển khoản ngân hàng.</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', padding: '32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'white', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)' }}>
              <PhoneCall size={28} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a', fontWeight: '700' }}>Hỗ trợ 24/7</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải đáp mọi thắc mắc và hỗ trợ trong suốt chuyến đi của bạn.</p>
          </div>
        </div>
      </section>

      <section className="policies-section" style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${policiesBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '64px 32px',
        color: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        marginBottom: '-48px',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="eyebrow" style={{ color: '#7eeadf', fontSize: '14px', letterSpacing: '0.1em' }}>THÔNG TIN HỮU ÍCH</span>
            <h2 style={{ fontSize: '32px', color: 'white', marginTop: '12px', marginBottom: '16px', fontWeight: '800' }}>Chính sách nhà xe</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Vui lòng tham khảo các quy định để có một chuyến hành trình thuận lợi nhất.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle size={28} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '18px', color: 'white', marginBottom: '8px', fontWeight: '700' }}>Chính sách hủy & hoàn tiền</h4>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>Miễn phí hủy vé trước 24 giờ so với giờ khởi hành. Hủy trước 12 giờ sẽ bị trừ 50% phí. Không hỗ trợ hủy vé trong vòng 12 giờ trước giờ chạy.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle size={28} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '18px', color: 'white', marginBottom: '8px', fontWeight: '700' }}>Quy định hành lý</h4>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>Mỗi hành khách được mang theo tối đa 20kg hành lý ký gửi và 1 túi xách nhỏ mang theo người. Quá cân sẽ tính thêm phụ phí 20.000đ/kg.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <RefreshCw size={28} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '18px', color: 'white', marginBottom: '8px', fontWeight: '700' }}>Đổi chuyến / Đổi ghế</h4>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>Hành khách có thể đổi chuyến bay hoặc đổi ghế miễn phí 1 lần trước 12 tiếng. Việc đổi phụ thuộc vào số ghế trống hiện tại.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle size={28} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '18px', color: 'white', marginBottom: '8px', fontWeight: '700' }}>Quy định có mặt</h4>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>Hành khách vui lòng có mặt tại bến hoặc điểm đón ít nhất 30 phút trước giờ khởi hành để làm thủ tục lên xe.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
