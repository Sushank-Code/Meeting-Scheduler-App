import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E7EB]" data-purpose="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Identity */}
        <Link to="/" aria-label="MeetSync Home" className="flex items-center gap-3 custom-focus-ring rounded group">
          <img
            src="/favicon.svg"
            alt="MeetSync Logo"
            className="w-9 h-9 rounded-md shadow-sm shrink-0"
          />
          <span className="text-xl font-bold tracking-tight text-[#111827] group-hover:text-[#2563EB] transition-colors">
            MeetSync
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors custom-focus-ring rounded">
                Dashboard
              </Link>
              <Link to="/meeting" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors custom-focus-ring rounded">
                Meetings
              </Link>
            </>
          ) : (
            <>
              <a className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors custom-focus-ring rounded" href="/#features">
                Features
              </a>
              <a className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors custom-focus-ring rounded" href="/#how-it-works">
                How It Works
              </a>
              <a className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors custom-focus-ring rounded" href="/#testimonials">
                Testimonials
              </a>
              <a className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors custom-focus-ring rounded" href="/#pricing">
                Pricing
              </a>
            </>
          )}
        </nav>

        {/* Header Action Items */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-gray-200 hover:border-blue-400 transition custom-focus-ring cursor-pointer"
              >
                <img
                  src={user?.profile_picture}
                  alt={user?.email || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-gray-700 max-w-30 truncate pr-1">
                  {user?.username}
                </span>
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md bg-white border border-[#E5E7EB] py-1 shadow-lg z-50"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2563EB]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/meeting"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2563EB]"
                  >
                    Meetings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false)
                      logout()
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="h-11 px-5 inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-md shadow-sm transition duration-150 custom-focus-ring cursor-pointer"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden">
          <button
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 custom-focus-ring cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {isLoggedIn ? (
            <>
              <div className="px-3 py-2 border-b border-gray-100 mb-2">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Dashboard
              </Link>
              <Link
                to="/meeting"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Meetings
              </Link>
              <div className="pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full text-center py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <a
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                href="/#testimonials"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 text-sm font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md cursor-pointer shadow-sm"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
