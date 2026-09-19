import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'
import CreateMeeting from '../../components/Meeting/CreateMeeting'

const initialUpcomingMeetings = [
  {
    id: 1,
    date: 'Tomorrow, Oct 25',
    time: '2:00 PM – 3:00 PM EDT',
    title: 'Q4 Product Roadmap',
    host: 'You (Host)',
    attendees: 'w/ Elena, Marcus',
    platform: 'Google Meet',
    platformUrl: 'https://meet.google.com',
    status: 'Scheduled',
    isHost: true,
  },
  {
    id: 2,
    date: 'Thu, Oct 26',
    time: '10:30 AM – 11:15 AM EDT',
    title: 'Architecture Review',
    host: 'Elena Rostova',
    attendees: 'w/ Dev Core Team',
    platform: 'Zoom Video',
    platformUrl: 'https://zoom.us',
    status: 'Scheduled',
    isHost: false,
  },
  {
    id: 3,
    date: 'Fri, Oct 27',
    time: '4:00 PM – 4:45 PM EDT',
    title: 'Design System Sync',
    host: 'You (Host)',
    attendees: 'w/ Dave, Liam',
    platform: 'Google Meet',
    platformUrl: 'https://meet.google.com',
    status: 'Scheduled',
    isHost: true,
  },
]

const recentActivities = [
  {
    id: 1,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop',
    text: 'You invited john@example.com to Q4 Product Roadmap.',
    time: '24m ago',
    type: 'invite',
  },
  {
    id: 2,
    initials: 'JR',
    text: 'Jane Roberts accepted your invitation to Enterprise Architecture.',
    time: '1h ago',
    type: 'accept',
  },
  {
    id: 3,
    icon: 'check',
    text: 'Meeting Client Onboarding marked as completed.',
    time: '3h ago',
    type: 'complete',
  },
  {
    id: 4,
    icon: 'sync',
    text: 'Google Calendar bidirectional sync completed without conflicts.',
    time: '5h ago',
    type: 'sync',
  },
]

const Dashboard = () => {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState(initialUpcomingMeetings)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showEmptyPreview, setShowEmptyPreview] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const displayName = user?.first_name || user?.email?.split('@')[0] || 'there'

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }, 600)
  }

  const handleMeetingCreated = (newMeeting) => {
    const newItem = {
      id: Date.now(),
      date: 'Upcoming',
      time: `${newMeeting.startDate || 'Soon'} • ${newMeeting.startTime || 'TBD'}`,
      title: newMeeting.title,
      host: 'You (Host)',
      attendees: `w/ ${newMeeting.attendees?.length || 1} attendees`,
      platform: newMeeting.platform === 'zoom' ? 'Zoom Video' : 'Google Meet',
      platformUrl: 'https://meet.google.com',
      status: 'Scheduled',
      isHost: true,
    }
    setMeetings([newItem, ...meetings])
  }

  return (
    <div className="w-full bg-[#F9FAFB] min-h-[calc(100vh-65px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Top Bar / Workspace Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="capitalize font-semibold text-slate-700">{displayName}</span>. Here is your schedule for the next 7 days.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-xs hover:bg-slate-50 transition active:scale-[0.98] cursor-pointer"
            >
              <svg
                className={`w-4 h-4 text-slate-600 transition-transform duration-500 ${isRefreshing ? 'rotate-180 animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics (3-column grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Organized */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Organized</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                <span>Host</span>
                <span className="opacity-40">•</span>
                <span>+2 this week</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600">12</span>
              <span className="text-xs text-slate-500">sessions scheduled</span>
            </div>
          </div>

          {/* Card 2: Participating */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Participating</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <span>Attendee</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600">5</span>
              <span className="text-xs text-slate-500">external invites</span>
            </div>
          </div>

          {/* Card 3: Upcoming */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Upcoming (Next 7 days)</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600">{meetings.length}</span>
              <span className="text-xs text-slate-500">confirmed events</span>
            </div>
          </div>
        </div>

        {/* Main Workspace Split: Table and Activity Feed */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Upcoming Meetings Table Container */}
          <div className="xl:col-span-8 flex flex-col bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">
                  Upcoming Meetings (Next 7 Days)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  {meetings.length} Scheduled
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmptyPreview(!showEmptyPreview)}
                className="text-xs text-slate-400 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>{showEmptyPreview ? 'Show meetings' : 'Preview empty state'}</span>
              </button>
            </div>

            {/* Populated Table */}
            {!showEmptyPreview && meetings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                      <th className="py-3 px-4 rounded-l-lg" scope="col">Date &amp; Time</th>
                      <th className="py-3 px-4" scope="col">Title &amp; Host</th>
                      <th className="py-3 px-4" scope="col">Platform</th>
                      <th className="py-3 px-4" scope="col">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-lg" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {meetings.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition group">
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm">{item.date}</span>
                            <span className="text-xs text-slate-500 mt-0.5">{item.time}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col gap-1 max-w-55">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${item.isHost ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {item.host}
                              </span>
                              <span className="text-xs text-slate-400 truncate">{item.attendees}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <a
                            href={item.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition"
                          >
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                            </svg>
                            <span>{item.platform}</span>
                          </a>
                        </td>
                        <td className="py-4 px-4 align-top">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{item.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 align-top text-right">
                          <div className="inline-flex items-center gap-2">
                            <a
                              href={item.platformUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition shadow-xs"
                            >
                              Enter
                            </a>
                            <Link
                              to="/meeting"
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
                            >
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Empty State Preview */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900">No upcoming meetings</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  You have zero meetings scheduled for the next 7 days. Enjoy the focus time or invite colleagues.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>+ Schedule Meeting</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity Feed (Clean vertical list) */}
          <div className="xl:col-span-4 flex flex-col bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  {act.avatar ? (
                    <img
                      src={act.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover mt-0.5 ring-1 ring-slate-100"
                    />
                  ) : act.initials ? (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mt-0.5">
                      {act.initials}
                    </div>
                  ) : act.icon === 'check' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-0.5 border border-emerald-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mt-0.5 border border-blue-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                      {act.text}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-slate-400">{act.time}</span>
                      <Link to="/meeting" className="text-xs text-blue-600 font-medium hover:underline">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification on Refresh */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span className="text-xs sm:text-sm font-medium">Upcoming schedule synchronized</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 text-slate-400 hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      )}

      {/* Create Meeting Modal */}
      <CreateMeeting
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  )
}

export default Dashboard