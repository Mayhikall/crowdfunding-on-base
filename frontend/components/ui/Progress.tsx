interface ProgressProps {
  value: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeStyles = {
  sm: 'h-3',
  md: 'h-5',
  lg: 'h-8',
}

export function Progress({ value, size = 'md', showLabel = true, className = '' }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          w-full bg-gray-200 border-4 border-black
          overflow-hidden
          ${sizeStyles[size]}
        `}
      >
        <div
          className="h-full bg-[#4ECDC4] transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right font-bold text-sm">
          {clampedValue.toFixed(0)}%
        </div>
      )}
    </div>
  )
}
