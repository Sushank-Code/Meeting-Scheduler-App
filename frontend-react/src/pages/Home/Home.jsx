import React from 'react'
import { googleLogo, facebookLogo, heroImage } from '../../assets/helper'
import { googleAuth } from '../../services/api'
import { useAuth } from '../../context/AuthContextProvider'

const Home = () => {
  const { SignupWithGoogle } = useAuth()

  return (
    <div className="relative overflow-hidden">

      <section className="w-full min-h-[calc(100vh-64px)] bg-linear-to-b from-white to-gray-50 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-16 py-12 gap-12">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Schedule Your Meetings <span className="text-blue-600">Effortlessly</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            MeetSync helps you organize, schedule, and manage your meetings with ease.
            Collaborate with your team seamlessly and never miss an important appointment again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={SignupWithGoogle} className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-white border border-blue-600 hover:border-gray-300 transition-all duration-200 rounded-lg px-6 py-3 cursor-pointer group">
              <img src={googleLogo} alt="Google" className="w-5 h-5" />
              <span className="text-white group-hover:text-gray-700 font-medium">Sign up with Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-white border border-blue-600 hover:border-gray-300 transition-all duration-200 rounded-lg px-6 py-3 cursor-pointer group">
              <img src={facebookLogo} alt="Facebook" className="w-5 h-5" />
              <span className="text-white group-hover:text-gray-700 font-medium">Sign up with Facebook</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <img
            src={heroImage}
            alt="MeetSync Dashboard"
            className="w-full max-w-lg h-auto object-contain rounded-2xl shadow-lg"
          />
        </div>
      </section>
    </div>
  )
}

export default Home