'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'donate' | 'withdraw' | 'refund' | 'faucet' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const variantStyles = {
  primary: 'bg-white text-black hover:bg-gray-100',
  donate: 'bg-[#4ECDC4] text-black hover:bg-[#45b8b0]',
  withdraw: 'bg-[#95E1D3] text-black hover:bg-[#7fd4c4]',
  refund: 'bg-[#FF6B6B] text-white hover:bg-[#e65c5c]',
  faucet: 'bg-[#FFE66D] text-black hover:bg-[#f5dc5d]',
  danger: 'bg-[#FF6B6B] text-white hover:bg-[#e65c5c]',
  ghost: 'bg-transparent text-black border-2 hover:bg-gray-100',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      disabled={isDisabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-bold uppercase tracking-wide
        border-4 border-black
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-100
        ${isDisabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
        }
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
