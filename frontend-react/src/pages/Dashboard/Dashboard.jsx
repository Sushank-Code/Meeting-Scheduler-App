import React from 'react'
import { useAuth } from '../../context/AuthContextProvider'

const Dashboard = () => {
  const { user,setUser } = useAuth()

  return (
    <div>
      <h1>Welcome, {user?.email}!</h1>
      <p>This is your dashboard.</p>
    </div>
  )
}

export default Dashboard