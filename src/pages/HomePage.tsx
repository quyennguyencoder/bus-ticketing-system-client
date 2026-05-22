import { Link } from 'react-router-dom'
import { ArrowRight, BusFront, ShieldCheck, Ticket } from 'lucide-react'

export const HomePage = () => (
  <section className="home-hero">
    <div className="home-hero__content">
      <span className="eyebrow">BusTicket</span>
      <h1>Đặt vé xe khách nhanh, rõ ràng và dễ theo dõi</h1>
      <p>
        Trang chủ cho phép bạn bắt đầu tìm chuyến, xem hành trình và tiếp tục đến các luồng đặt vé, thanh toán hoặc quản trị.
      </p>

      <div className="home-hero__actions">
        <Link to="/trips/search" className="btn btn-primary home-hero__button">
          <ArrowRight size={16} />
          Tìm chuyến ngay
        </Link>
        <Link to="/login" className="btn btn-secondary home-hero__button">
          <Ticket size={16} />
          Đăng nhập để đặt vé
        </Link>
      </div>

      <div className="home-hero__stats">
        <article>
          <BusFront size={18} />
          <strong>200+</strong>
          <span>Chuyến xe mỗi ngày</span>
        </article>
        <article>
          <Ticket size={18} />
          <strong>99%</strong>
          <span>Quy trình đặt vé mượt</span>
        </article>
        <article>
          <ShieldCheck size={18} />
          <strong>An toàn</strong>
          <span>Thanh toán và giữ ghế ổn định</span>
        </article>
      </div>
    </div>
  </section>
)
