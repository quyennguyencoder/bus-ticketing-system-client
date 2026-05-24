import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/auth.store'
import { getApiErrorMessage } from '../utils/api-error'
import { authService } from '../services/auth.service'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Dang nhap thanh cong')
      navigate(from, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setLoading(true)
    try {
      const response = await authService.socialLogin(provider)
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl
      } else {
        throw new Error('Khong the lay dia chi dang nhap')
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Dang nhap</h1>
        <p>Tiep tuc dat ve va quan ly cac don hang cua ban.</p>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input
          label="Mat khau"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Button type="submit" disabled={loading} icon={<LogIn size={16} />}>
          {loading ? 'Dang xu ly' : 'Dang nhap'}
        </Button>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ padding: '0 16px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Hoặc đăng nhập với
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <Button 
            type="button" 
            variant="outline" 
            style={{ flex: 1, display: 'flex', justifyContent: 'center', color: '#db4437', borderColor: '#f8d7da', backgroundColor: '#fff' }}
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            Google
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            style={{ flex: 1, display: 'flex', justifyContent: 'center', color: '#4267B2', borderColor: '#d1e7dd', backgroundColor: '#fff' }}
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
          >
            Facebook
          </Button>
        </div>

        <span style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
          Chua co tai khoan? <Link to="/register" style={{ fontWeight: 600 }}>Dang ky</Link>
        </span>
      </form>
    </section>
  )
}

