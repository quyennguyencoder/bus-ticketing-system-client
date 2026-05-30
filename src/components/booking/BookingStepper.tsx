import { ChevronRight } from 'lucide-react'

export const BookingStepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Chọn chỗ ngồi' },
    { id: 2, label: 'Chọn điểm đón trả' },
    { id: 3, label: 'Xác nhận & Thanh toán' },
  ]

  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      backgroundColor: '#fff', 
      padding: '12px 20px', 
      borderRadius: '12px', 
      border: '1px solid #e2e8f0',
      fontSize: '13px',
      fontWeight: 600,
      color: '#64748b',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {steps.map((step, index) => {
        const isActive = step.id <= currentStep;
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              color: isActive ? '#0f766e' : '#64748b', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <span style={{ 
                display: 'inline-flex', 
                width: '20px', 
                height: '20px', 
                borderRadius: '50%', 
                backgroundColor: isActive ? '#0f766e' : '#f1f5f9', 
                color: isActive ? '#fff' : '#64748b', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '11px',
                border: isActive ? 'none' : '1px solid #cbd5e1'
              }}>
                {step.id}
              </span>
              {step.label}
            </span>
            {index < steps.length - 1 && <ChevronRight size={14} color="#94a3b8" />}
          </div>
        )
      })}
    </nav>
  )
}
