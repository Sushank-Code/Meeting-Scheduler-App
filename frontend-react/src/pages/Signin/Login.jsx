import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'
import { googleLogo } from '../../assets/helper'

const Login = () => {
    const { SignupWithGoogle, isLoggedIn } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard')
        }
    }, [isLoggedIn, navigate])

    return (
        <div className="bg-grid-pattern min-h-[calc(100vh-65px)] text-slate-800 antialiased flex flex-col justify-between selection:bg-blue-100 selection:text-blue-700 py-10 px-4">
            {/* BEGIN: MainHeader */}
            <header className="text-center mb-2">
                <Link to="/" className="inline-flex items-center gap-3 justify-center mb-2 group">
                    {/* Logo Image */}
                    <img
                        src="/favicon.svg"
                        alt="MeetSync Logo"
                        className="w-10 h-10 shrink-0 shadow-sm rounded-[10px]"
                    />
                    <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        MeetSync
                    </span>
                </Link>
                <p className="text-sm text-slate-500 font-normal">
                    Smart meeting scheduling &amp; calendar orchestration
                </p>
            </header>
            {/* END: MainHeader */}

            {/* BEGIN: AuthCardSection */}
            <main className="grow flex items-center justify-center py-6">
                <div className="w-full max-w-110 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 relative">
                    {/* Card Title & Subtitle */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Sign In to Workspace
                        </h1>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Connect your Google account to access your meetings, schedule calendar events, and manage RSVPs.
                        </p>
                    </div>

                    {/* Social Google SSO Button */}
                    <div className="space-y-4">
                        <button
                            onClick={SignupWithGoogle}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 font-semibold text-sm shadow-sm transition-all duration-150 custom-focus-ring cursor-pointer"
                        >
                            <img
                                src={googleLogo}
                                alt="Google"
                                className="h-5 w-5 shrink-0 object-contain"
                            />
                            <span>Continue with Google</span>
                        </button>

                        {/* Feature Perks Box */}
                        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 mt-6">
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 mb-2.5">
                                Included with your account
                            </p>
                            <ul className="space-y-2 text-xs text-slate-600">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                    <span>Automatic Google Meet link generation</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    <span>Instant two-way calendar sync</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                    <span>Public RSVP tracking without client login</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            {/* END: AuthCardSection */}
            
            <footer className="py-4 text-center">
                <p className="text-xl text-slate-400">
                    <Link to="/" className="text-blue-600 hover:text-blue-700 hover:underline">
                        ← Back to Home
                    </Link>
                </p>
            </footer>
        </div>
    )
}

export default Login