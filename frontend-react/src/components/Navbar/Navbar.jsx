import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const isLoggedIn = Boolean(localStorage.getItem('authToken'))

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
              <Link to="/" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Dashboard
              </Link>
              <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
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
              <button className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:flex">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500"></span>
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-blue-200">
                RK
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
