'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '../wallet/ConnectButton'

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Check if we're on landing page
  const isLandingPage = pathname === '/'

  const navLinks = [
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/faucet', label: 'Faucet' },
    { href: '/creator', label: 'Creator' },
    { href: '/donor', label: 'Donor' },
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  // Landing page: simplified navbar with logo only
  if (isLandingPage) {
    return (
      <header className="sticky top-0 z-50 bg-[#FFE66D] border-b-4 border-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-black text-lg md:text-xl uppercase tracking-tight">
                SEDULUR<span className="text-[#FF6B6B]">FUND</span>
              </span>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  // Dashboard pages: full navbar with navigation
  return (
    <header className="sticky top-0 z-50 bg-[#FFE66D] border-b-4 border-black">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="font-black text-lg md:text-xl uppercase tracking-tight">
              SEDULUR<span className="text-[#FF6B6B]">FUND</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 font-bold uppercase text-sm
                  border-2 border-transparent
                  transition-all duration-100
                  hover:bg-white hover:border-black
                  ${pathname === link.href ? 'bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''}
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Connect Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 border-2 border-black bg-white"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-black transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-black transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-black transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t-4 border-black bg-[#FFE66D] pb-4">
            <nav className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`
                    px-4 py-3 font-bold uppercase text-sm
                    border-4 border-black
                    transition-all duration-100
                    ${pathname === link.href 
                      ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white hover:bg-gray-100'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 px-4">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
