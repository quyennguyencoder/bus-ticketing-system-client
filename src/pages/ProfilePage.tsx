import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
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

  const handleSubmit = async (event: FormEvent) => {
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

  return (
    <section className="page-stack narrow">
      <div className="page-heading compact">
        <span className="eyebrow">Ho so</span>
        <h1>Thong tin ca nhan</h1>
        <p>{user?.email}</p>
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
    </section>
  )
}
