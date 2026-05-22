import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/auth.store'
import { getApiErrorMessage } from '../utils/api-error'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Dang ky thanh cong')
      navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Tao tai khoan</h1>
        <p>Luu thong tin hanh khach va theo doi lich su dat ve.</p>
        <Input label="Ho ten" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input
          label="So dien thoai"
          value={form.phoneNumber}
          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
          required
        />
        <Input
          label="Mat khau"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <Input
          label="Nhap lai mat khau"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          required
        />
        <Button type="submit" disabled={loading} icon={<UserPlus size={16} />}>
          {loading ? 'Dang xu ly' : 'Dang ky'}
        </Button>
        <span>
          Da co tai khoan? <Link to="/login">Dang nhap</Link>
        </span>
      </form>
    </section>
  )
}
