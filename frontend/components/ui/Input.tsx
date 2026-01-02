import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 font-bold uppercase text-sm tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3
            bg-white border-4 border-black
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            font-medium
            placeholder:text-gray-400
            focus:outline-none focus:ring-0
            focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            focus:translate-x-[2px] focus:translate-y-[2px]
            transition-all duration-100
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 font-bold uppercase text-sm tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3
            bg-white border-4 border-black
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            font-medium
            placeholder:text-gray-400
            focus:outline-none focus:ring-0
            focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            focus:translate-x-[2px] focus:translate-y-[2px]
            transition-all duration-100
            resize-none
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 font-bold uppercase text-sm tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-3
            bg-white border-4 border-black
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            font-medium
            focus:outline-none focus:ring-0
            focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
            focus:translate-x-[2px] focus:translate-y-[2px]
            transition-all duration-100
            cursor-pointer
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
