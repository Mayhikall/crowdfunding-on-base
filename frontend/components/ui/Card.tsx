import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border-4 border-black
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        ${hover ? 'transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 border-b-4 border-black ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
