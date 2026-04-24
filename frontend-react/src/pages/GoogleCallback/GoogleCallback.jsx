import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContextProvider'
import { useNavigate, useLocation } from 'react-router-dom'

const GoogleCallback = () => {
    const { CompleteGoogleLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    
    useEffect(() => {
        const callbackKey = `google-callback-${location.search}`
        if (sessionStorage.getItem(callbackKey)) return
        sessionStorage.setItem(callbackKey, 'done')

        const run = async () => {
            try {
                await CompleteGoogleLogin(location.search)
                navigate('/dashboard')
            } catch (error) {
                navigate('/')
            }
        }
        run()
    }, [location.search, navigate,CompleteGoogleLogin])

    return (
        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center bg-linear-to-b from-slate-50 via-white to-blue-50 px-4 py-10 sm:px-6">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                </div>

                <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Signing you in
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    We&apos;re securely connecting your Google account and preparing your workspace.
                </p>

                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    This usually takes just a moment. Please keep this tab open.
                </div>
            </div>
        </section>
    )
}

export default GoogleCallback
