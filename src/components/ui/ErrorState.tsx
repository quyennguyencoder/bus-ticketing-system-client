import { AlertTriangle } from 'lucide-react'

export const ErrorState = ({ message }: { message: string }) => (
  <div className="state state-error">
    <AlertTriangle size={24} />
    <h2>Khong tai duoc du lieu</h2>
    <p>{message}</p>
  </div>
)

