import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'

const Navbar = () => {
  const { isLoggedIn, logout,user } = useAuth()

  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)] backdrop-blur md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-300/60">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-900">MeetSync</p>
            <p className="hidden text-xs text-slate-500 sm:block">Scheduling for modern teams</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full bg-slate-100/80 p-1 md:flex">
          {isLoggedIn ? (
            <>
              <Link to="/meeting" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                Meetings
              </Link>
              <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                Calendar
              </Link>
              <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                Availability
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                Features
              </a>
              <a href="#how-it-works" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                How it works
              </a>
              <a href="#benefits" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                Benefits
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="group relative">
                <div className="flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-lg shadow-slate-300/50 ring-1 ring-slate-200 transition hover:ring-slate-300">
                  <img
                    src={user?.profile_picture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pointer-events-none absolute right-0 top-full pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="w-44 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                    <Link
                      to="/dashboard"
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="mt-1 block rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-5">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
