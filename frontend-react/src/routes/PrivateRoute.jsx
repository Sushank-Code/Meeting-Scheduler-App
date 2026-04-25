import React from 'react'
import { useAuth } from '../context/AuthContextProvider'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
    const { isLoggedIn } = useAuth()
    return isLoggedIn ? (
        children 
    ) : (
        <Navigate to='/' />
    )
}

export default PrivateRoute