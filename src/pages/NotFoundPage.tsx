import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export const NotFoundPage = () => (
  <section className="state">
    <h1>Khong tim thay trang</h1>
    <p>Duong dan nay khong ton tai hoac da bi thay doi.</p>
    <Link to="/">
      <Button>Ve trang tim chuyen</Button>
    </Link>
  </section>
)

