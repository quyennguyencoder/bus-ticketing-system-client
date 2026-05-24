import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Camera, Loader2, Key } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { userService } from '../services/user.service'
import { useAuthStore } from '../stores/auth.store'
import { getApiErrorMessage } from '../utils/api-error'

export const ProfilePage = () => {
  const { user, accessToken, refreshToken, setAuth } = useAuthStore()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !accessToken || !refreshToken) return
    setSaving(true)
    try {
      const response = await userService.updateUserProfile(user.id, form)
      if (!response.data) throw new Error(response.message || 'Khong cap nhat duoc ho so')
      setAuth({ accessToken, refreshToken, user: response.data })
      toast.success('Da cap nhat ho so')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    setChangingPassword(true)
    try {
      await userService.changePassword(user.id, passwordForm)
      toast.success('Đã đổi mật khẩu thành công')
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setChangingPassword(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !accessToken || !refreshToken) return

    setUploading(true)
    try {
      const response = await userService.uploadAvatar(user.id, file)
      if (!response.data) throw new Error(response.message || 'Khong tai len duoc anh dai dien')
      setAuth({ accessToken, refreshToken, user: response.data })
      toast.success('Da cap nhat anh dai dien')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const avatarUrl = user?.avatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8080/api/v1/files/${user.avatar}`) 
    : undefined

  return (
    <section className="page-stack narrow">
      <div className="page-heading compact" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div 
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', 
              backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '24px', fontWeight: 600
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ 
              position: 'absolute', bottom: -4, right: -4, 
              backgroundColor: '#2563eb', color: 'white', 
              border: 'none', borderRadius: '50%', width: '32px', height: '32px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
            title="Cap nhat anh dai dien"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png, image/webp" 
            style={{ display: 'none' }} 
          />
        </div>
        <div>
          <span className="eyebrow">Ho so</span>
          <h1 style={{ margin: '4px 0' }}>Thong tin ca nhan</h1>
          <p style={{ margin: 0, color: '#64748b' }}>{user?.email}</p>
        </div>
      </div>
      <form className="panel checkout-form" onSubmit={handleSubmit}>
        <Input label="Ho ten" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
        <Input
          label="So dien thoai"
          value={form.phoneNumber}
          onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
        />
        <Button type="submit" disabled={saving} icon={<Save size={16} />}>
          {saving ? 'Dang luu' : 'Luu thay doi'}
        </Button>
      </form>

      {!showPasswordForm ? (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setShowPasswordForm(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px'
            }}
          >
            Đổi mật khẩu?
          </button>
        </div>
      ) : (
        <form className="panel checkout-form" onSubmit={handlePasswordSubmit} style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Đổi mật khẩu</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                Cập nhật mật khẩu mới để bảo mật tài khoản
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(false)
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '4px 0'
              }}
            >
              Hủy
            </button>
          </div>
          
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(event) => setPasswordForm({ ...passwordForm, oldPassword: event.target.value })}
            required
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            value={passwordForm.newPassword}
            onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
            required
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
            required
          />
          
          <Button type="submit" disabled={changingPassword} icon={<Key size={16} />}>
            {changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      )}
    </section>
  )
}
