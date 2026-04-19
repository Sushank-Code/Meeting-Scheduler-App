import axios from 'axios'
import React, { useState, useContext,createContext } from 'react'
import { googleAuth } from '../services/api'
// creating context 
const AuthContext = createContext()

const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [error, setError] = useState({})
    const [loading, setLoading] = useState(false)

    const SignupWithGoogle = async () => {
        const response = await googleAuth()
        console.log(response)
        const { authorizationUrl } = response.data
        window.location.href = authorizationUrl
    }

    const value = {}
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider
export const useAuth = () => useContext(AuthContext)