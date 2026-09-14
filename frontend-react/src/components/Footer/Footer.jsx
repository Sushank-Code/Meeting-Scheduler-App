import { useState } from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  return (
    <footer className="bg-[#1E3A8A] text-white pt-16 pb-12" data-purpose="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Footer CTA Block */}
        <div className="pb-12 border-b border-blue-800/80 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to streamline your team's meetings?
            </h2>
            <p className="mt-2 text-blue-200 text-base max-w-lg">
              Join thousands of professionals already saving 4+ hours every single week with MeetSync.
            </p>
          </div>

          {/* Newsletter Signup & Action Form */}
          <div className="lg:col-span-5 w-full">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md ml-auto" id="newsletter-form">
              <label className="sr-only" htmlFor="newsletter-email">
                Work email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                required
                className="w-full h-11 px-4 text-sm text-[#111827] bg-white rounded-md border border-transparent focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 outline-none"
              />
              <button
                type="submit"
                className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition duration-150 shrink-0 shadow-md custom-focus-ring cursor-pointer"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-300 mt-2 text-right">
                ✓ Thank you for subscribing to MeetSync updates!
              </p>
            )}
          </div>
        </div>

        {/* Links & Navigation */}
        <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-blue-800/60 text-sm">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">Product</h3>
            <ul className="space-y-2.5 text-blue-100">
              <li><a className="hover:text-white transition" href="#features">Features</a></li>
              <li><a className="hover:text-white transition" href="#how-it-works">Integrations</a></li>
              <li><a className="hover:text-white transition" href="#pricing">Pricing Tier</a></li>
              <li><a className="hover:text-white transition" href="#features">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">Developers</h3>
            <ul className="space-y-2.5 text-blue-100">
              <li><a className="hover:text-white transition" href="#features">API Docs</a></li>
              <li><a className="hover:text-white transition" href="#features">Webhooks</a></li>
              <li><a className="hover:text-white transition" href="#how-it-works">Google Calendar Sync</a></li>
              <li><a className="hover:text-white transition" href="#how-it-works">Zoom OAuth</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">Security &amp; Legal</h3>
            <ul className="space-y-2.5 text-blue-100">
              <li><a className="hover:text-white transition" >Privacy Policy</a></li>
              <li><a className="hover:text-white transition" >Terms of Service</a></li>
              <li><a className="hover:text-white transition" >Security Controls</a></li>
              <li><a className="hover:text-white transition" >GDPR Compliance</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">Support</h3>
            <ul className="space-y-2.5 text-blue-100">
              <li><a className="hover:text-white transition" >Contact Support</a></li>
              <li><a className="hover:text-white transition" >Knowledge Base</a></li>
              <li><a className="hover:text-white transition" >System Status</a></li>
              <li><a className="hover:text-white transition" >Book a Demo</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright & Brand Stamp */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">MeetSync</span>
            <span>•</span>
            <span>© 2025 MeetSync, Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="hover:text-white transition" href="#">Privacy</a>
            <a className="hover:text-white transition" href="#">Terms</a>
            <a className="hover:text-white transition" href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer