import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { googleLogo, screenImg } from '../../assets/helper'
import { useAuth } from '../../context/AuthContextProvider'
import Footer from '../../components/Footer/Footer'

const testimonialsData = [
  {
    quote: '"MeetSync transformed how we run roadmap reviews. Auto-provisioning Google Meet links and live RSVP tracking saves our team hours every week."',
    name: 'Sarah Jenkins',
    role: 'Principal PM at Acme Corp',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    initials: 'SJ',
    stars: 5,
  },
  {
    quote: '"The public RSVP flow without login is pure genius. Our external clients accept meetings in 2 seconds without creating another account."',
    name: 'David Kim',
    role: 'Tech Lead at Partner.io',
    initials: 'DK',
    bg: 'bg-blue-600',
    stars: 5,
  },
  {
    quote: '"The clean UI and zero-fuss calendar synchronization makes scheduling feel effortless and reliable across remote engineering teams."',
    name: 'Elena Rostova',
    role: 'Design Director at Studio',
    initials: 'ER',
    bg: 'bg-emerald-600',
    stars: 5,
  },
]

const Home = () => {
  const { SignupWithGoogle, isLoggedIn } = useAuth()
  const [activeTestiIndex, setActiveTestiIndex] = useState(0)

  const handleNextTestimonial = () => {
    setActiveTestiIndex((prev) => (prev + 1) % testimonialsData.length)
  }

  const handlePrevTestimonial = () => {
    setActiveTestiIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length)
  }

  // Get reordered array based on active index for desktop carousel view
  const displayedTestimonials = [
    testimonialsData[activeTestiIndex],
    testimonialsData[(activeTestiIndex + 1) % testimonialsData.length],
    testimonialsData[(activeTestiIndex + 2) % testimonialsData.length],
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* BEGIN: HeroSection */}
        <section className="relative bg-[#EFF6FF] border-b border-blue-100 py-16 sm:py-20 lg:py-24 overflow-hidden" data-purpose="hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Copy Content (Left Column) */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Inline Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-xs font-semibold text-[#2563EB] mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  New: Zoom &amp; Google Meet Two-Way Sync
                </div>

                {/* Primary Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.12]">
                  Schedule Meetings <br className="hidden sm:inline" />
                  <span className="text-[#2563EB]">Seamlessly</span>
                </h1>

                {/* Sub-headline */}
                <p className="mt-6 text-lg sm:text-xl text-[#6B7280] max-w-xl leading-relaxed">
                  Create Google Meet or Zoom meetings, invite participants, and manage RSVPs – all in one clean interface.
                </p>

                {/* Call to Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
                  {isLoggedIn ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        to="/dashboard"
                        className="h-12 px-7 inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-medium rounded-md shadow-sm hover:shadow transition custom-focus-ring"
                      >
                        Go to Dashboard
                      </Link>
                      <Link
                        to="/meeting"
                        className="h-12 px-6 inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 text-base font-medium rounded-md shadow-sm transition custom-focus-ring"
                      >
                        Create Meeting
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={SignupWithGoogle}
                      type="button"
                      className="h-12 px-6 inline-flex items-center justify-center gap-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-medium rounded-md shadow-sm hover:shadow transition custom-focus-ring cursor-pointer"
                    >
                      <img src={googleLogo} alt="Google" className="h-5 w-5 bg-white p-0.5 rounded-full" />
                      <span>Sign up with Google</span>
                    </button>
                  )}

                  <a
                    className="inline-flex items-center gap-1.5 text-base font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline custom-focus-ring py-2"
                    href="#how-it-works"
                  >
                    <span>Learn more</span>
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>

                {/* Social Proof Bar */}
                <div className="mt-10 pt-6 border-t border-blue-200/70 w-full max-w-lg">
                  <p className="text-xs sm:text-sm font-medium text-[#6B7280] flex items-center gap-2 flex-wrap">
                    <span>Trusted by 10,000+ teams</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                    <span>No credit card required</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                    <span className="text-emerald-700 font-semibold">100% Free tier</span>
                  </p>
                </div>
              </div>

              {/* Hero Graphic / UI Mockup (Right Column) */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-lg">
                  {/* Visual Mockup Container */}
                  <div className="relative bg-white rounded-[10px] p-2.5 shadow-2xl border border-blue-100">
                    <img
                      alt="MeetSync Dashboard Preview"
                      className="w-full h-auto rounded-md object-cover"
                      loading="eager"
                      src={screenImg}
                    />
                  </div>

                  {/* Floating Micro Badge 1 */}
                  <aside aria-label="Status indicator" className="absolute -top-4 -left-3 sm:-left-6 bg-white/95 backdrop-blur px-3.5 py-2 rounded-md shadow-lg border border-gray-100 flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-[#10B981]">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"></path>
                      </svg>
                    </span>
                    <span className="text-xs font-semibold text-gray-800">Google Meet Ready</span>
                  </aside>

                  {/* Floating Micro Badge 2 */}
                  <aside aria-label="RSVP Status" className="absolute -bottom-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur px-3.5 py-2 rounded-md shadow-lg border border-gray-100 flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-blue-500 text-[9px] font-bold text-white text-center leading-5">SJ</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-indigo-500 text-[9px] font-bold text-white text-center leading-5">DK</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-500 text-[9px] font-bold text-white text-center leading-5">ER</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">4 RSVPs Confirmed</span>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: HeroSection */}

        {/* BEGIN: FeaturesGrid */}
        <section className="py-20 bg-[#F9FAFB]" data-purpose="features" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-2">Built For High-Velocity Teams</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                Everything you need to orchestrate meetings
              </h3>
              <p className="mt-4 text-base sm:text-lg text-[#6B7280]">
                Eliminate friction between calendar invites, video conferencing links, and attendance tracking.
              </p>
            </div>

            {/* 3-Column Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Video Integration */}
              <div className="bg-white border border-[#E5E7EB] rounded-md p-6 shadow-sm card-lift flex flex-col justify-between" data-purpose="feature-card">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[#111827] mb-2.5">One-Click Video Links</h4>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    Generate Google Meet or Zoom links automatically – no manual copy-paste. Integrated with your personal credentials.
                  </p>
                </div>
                {/* Interactive Visual Preview Tag */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200/80 rounded-md px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-mono text-gray-700 truncate">meet.google.com/xyz-qwer-vbn</span>
                  </div>
                </div>
              </div>

              {/* Feature 2: Smart Invitations */}
              <div className="bg-white border border-[#E5E7EB] rounded-md p-6 shadow-sm card-lift flex flex-col justify-between" data-purpose="feature-card">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[#111827] mb-2.5">Smart Invitations</h4>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    Invite by email, auto-detect existing users, and send beautiful RSVP emails with calendar invites directly attached.
                  </p>
                </div>
                {/* Interactive Preview Chips */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-sm">alex@company.com</span>
                    <span className="inline-flex items-center text-[11px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-sm">team@partner.io</span>
                  </div>
                </div>
              </div>

              {/* Feature 3: Real-Time RSVP Tracking */}
              <div className="bg-white border border-[#E5E7EB] rounded-md p-6 shadow-sm card-lift flex flex-col justify-between md:col-span-2 lg:col-span-1" data-purpose="feature-card">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mb-5">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[#111827] mb-2.5">Real-time RSVP Management</h4>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    See who accepted, who declined, and send friendly nudges with a single click. Keep everyone aligned effortlessly.
                  </p>
                </div>
                {/* Progress Bar Preview */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-1.5 font-medium">
                    <span>Confirmed Attendance</span>
                    <span className="font-bold text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#10B981] h-2 rounded-full w-[75%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: FeaturesGrid */}

        {/* BEGIN: HowItWorks */}
        <section className="py-20 bg-white border-y border-[#E5E7EB]" data-purpose="workflow" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Workflow Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block px-3 py-1 bg-blue-50 text-[#2563EB] text-xs font-semibold uppercase tracking-wider rounded-md mb-3">
                Simple 3-Step Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                How MeetSync Works
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#6B7280]">
                Start scheduling with confidence in less than sixty seconds.
              </p>
            </div>

            {/* Stepper Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-7 flex flex-col card-lift">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-base shadow-sm">
                    1
                  </div>
                  <div className="p-2 rounded-md bg-blue-50 text-[#2563EB]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Create</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Fill a simple form, pick a date, choose your platform (Zoom or Google Meet), and add participant emails.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-7 flex flex-col card-lift">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-base shadow-sm">
                    2
                  </div>
                  <div className="p-2 rounded-md bg-blue-50 text-[#2563EB]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Send</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Participants receive an email with an auto-generated meeting link and one-click RSVP confirmation buttons.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-7 flex flex-col card-lift">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-base shadow-sm">
                    3
                  </div>
                  <div className="p-2 rounded-md bg-blue-50 text-[#2563EB]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Track</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Watch live RSVP status and join the meeting directly from the centralized organizer dashboard without hassle.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: HowItWorks */}

        {/* BEGIN: TestimonialsSection */}
        <section className="py-20 bg-[#F9FAFB]" data-purpose="testimonials" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">User Reviews</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mt-1">
                  Loved by fast-moving teams
                </h2>
              </div>
              {/* Carousel Navigation Controls */}
              <div aria-label="Testimonial controls" className="flex items-center gap-2 mt-4 md:mt-0">
                <button
                  aria-label="Previous testimonial"
                  className="p-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition custom-focus-ring cursor-pointer"
                  onClick={handlePrevTestimonial}
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
                <button
                  aria-label="Next testimonial"
                  className="p-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition custom-focus-ring cursor-pointer"
                  onClick={handleNextTestimonial}
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Testimonials Cards Grid */}
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedTestimonials.map((item, index) => (
                <div
                  key={index}
                  className={`testimonial-card border border-[#E5E7EB] rounded-md p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${index === 1 ? 'bg-[#F3F4F6]' : 'bg-white'
                    }`}
                >
                  <div>
                    {/* 5 Stars */}
                    <div aria-label="5 out of 5 stars" className="flex items-center text-amber-400 mb-4 tracking-wider">
                      {'★'.repeat(item.stars)}
                    </div>
                    <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed italic">
                      {item.quote}
                    </blockquote>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                    {item.image ? (
                      <img
                        alt={item.name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-200"
                        src={item.image}
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-full ${item.bg || 'bg-blue-600'} text-white font-semibold flex items-center justify-center text-sm shadow-inner`}>
                        {item.initials}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-[#111827]">{item.name}</div>
                      <div className="text-xs text-[#6B7280]">{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* END: TestimonialsSection */}

        {/* BEGIN: PricingTeaser */}
        <section className="py-16 bg-white" data-purpose="pricing-callout" id="pricing">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-8 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">Start free, upgrade as your team expands</h2>
              <p className="mt-2 text-[#6B7280] max-w-xl mx-auto text-sm sm:text-base">
                Free forever for individuals. Simple, transparent plans with team collaboration controls for organizations.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="h-11 px-6 inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-md shadow-sm transition custom-focus-ring"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={SignupWithGoogle}
                    className="h-11 px-6 inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-md shadow-sm transition custom-focus-ring cursor-pointer"
                  >
                    Get Started for Free
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* END: PricingTeaser */}
      </main>

      {/* Render separated Footer */}
      <Footer />
    </div>
  )
}

export default Home
