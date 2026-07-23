import React, { useEffect, useState, useContext, createContext } from 'react'
import { googleAuth, googleAuthorization, getUserProfile } from '../services/api'
// import { useNavigate } from 'react-router-dom'

// creating context 
const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isLoggedIn, setisLoggedIn] = useState(!!localStorage.getItem('access_token'))

    const getMe = async () => {
        try {
            const response = await getUserProfile()
            setUser(response.data)
            setisLoggedIn(true)
        } catch (error) {
            setUser(null)
            setisLoggedIn(false)
        }
    }

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            getMe()
        }
        else{
            setUser(null)
            setisLoggedIn(false)
        }
    }, [])

    const SignupWithGoogle = async () => {
        const response = await googleAuth()
        // console.log(response.data.authorization_url)

        const { authorization_url } = response.data        // Destructuring
        window.location.href = authorization_url
    }

    // const redirect_uri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const CompleteGoogleLogin = async (search) => {
        const params = new URLSearchParams(search)         // {name: "John Doe", age: 30 }
        // const queryString = params.toString()           // "name=John+Doe&age=30"  

        const code = params.get('code');
        const state = params.get('state');

        const respose = await googleAuthorization(
            {
                code,
                state,
            }
        )
        // console.log(respose)
        localStorage.setItem('access_token', respose.data.access)
        localStorage.setItem('refresh_token', respose.data.refresh)
        setisLoggedIn(true)
        await getMe()
    }

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
        setUser(null);
        setisLoggedIn(false);
    };

    const value = {
        user,
        setUser,
        isLoggedIn,
        setisLoggedIn,
        getMe,
        SignupWithGoogle,
        CompleteGoogleLogin,
        logout,
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider
export const useAuth = () => useContext(AuthContext)
