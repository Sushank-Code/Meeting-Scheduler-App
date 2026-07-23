import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-6">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-[1.75rem] border border-slate-800/80 bg-slate-950 px-4 py-3 shadow-[0_20px_50px_-24px_rgba(2,8,23,0.9)] md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-white">MeetSync</p>
            <p className="hidden text-xs text-slate-400 sm:block">Scheduling for modern teams</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/80 p-1 md:flex">
          {isLoggedIn ? (
            <>
              <Link to="/meeting" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-cyan-400/10 hover:text-white">
                Meetings
              </Link>
              <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-cyan-400/10 hover:text-white">
                Calendar
              </Link>
              <Link to="/" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-cyan-400/10 hover:text-white">
                Availability
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-cyan-400/10 hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-cyan-400/10 hover:text-white">
                How it works
              </a>
              <a href="#benefits" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-cyan-400/10 hover:text-white">
                Benefits
              </a>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="group relative">
                <div className="flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-800 bg-slate-900 shadow-lg shadow-cyan-950/30 ring-1 ring-slate-800 transition hover:border-cyan-400/30 hover:ring-cyan-400/20">
                  <img
                    src={user?.profile_picture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pointer-events-none absolute right-0 top-full pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="w-44 origin-top-right rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-xl shadow-black/40">
                    <Link
                      to="/dashboard"
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-cyan-400/10 hover:text-white"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="mt-1 block rounded-xl px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="inline-flex items-center rounded-full bg-linear-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 sm:px-5">
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
