import React from 'react'
import { googleLogo, facebookLogo, heroImage } from '../../assets/helper'
import { googleAuth } from '../../services/api'
import { useAuth } from '../../context/AuthContextProvider'

const Home = () => {
  const { SignupWithGoogle, isLoggedIn } = useAuth()

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative isolate flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-between gap-10 px-6 py-10 sm:px-8 lg:flex-row lg:gap-14 lg:px-16 lg:py-16">
        <div className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-6">
          <div className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium tracking-wide text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur">
            Smart scheduling for modern teams
          </div>

          <div className="space-y-5">
            <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Schedule your meetings <span className="bg-linear-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">effortlessly</span>
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              MeetSync helps you organize, schedule, and manage your meetings with ease.
              Collaborate with your team seamlessly and never miss an important appointment again.
            </p>
          </div>

          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="group inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-cyan-300">
                  Create meeting
                </button>
                <button className="group inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
                  Open calendar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={SignupWithGoogle}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/30 bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-cyan-50 cursor-pointer"
                >
                  <img src={googleLogo} alt="Google" className="h-5 w-5" />
                  <span>Sign up with Google</span>
                </button>
                <button className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 cursor-pointer">
                  <img src={facebookLogo} alt="Facebook" className="h-5 w-5" />
                  <span>Sign up with Facebook</span>
                </button>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Quick setup, secure access, and a clean workspace for every meeting.
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-1 justify-center lg:justify-end">
          <div className="w-full max-w-xl rounded-4xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur">
            <img
              src={heroImage}
              alt="MeetSync Dashboard"
              className="h-auto w-full rounded-3xl object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
