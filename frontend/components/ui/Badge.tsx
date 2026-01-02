import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantStyles = {
  default: 'bg-gray-200 text-black',
  success: 'bg-[#95E1D3] text-black',
  warning: 'bg-[#FFE66D] text-black',
  danger: 'bg-[#FF6B6B] text-white',
  info: 'bg-[#4ECDC4] text-black',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-block px-3 py-1
        border-2 border-black
        font-bold uppercase text-xs tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'active' | 'success' | 'failed' | 'claimed' | 'cancelled'
}

const statusConfig = {
  active: { label: 'Active', variant: 'info' as const },
  success: { label: 'Success', variant: 'success' as const },
  failed: { label: 'Failed', variant: 'danger' as const },
  claimed: { label: 'Claimed', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'danger' as const },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
