import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col antialiased selection:bg-blue-100 selection:text-blue-700">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
