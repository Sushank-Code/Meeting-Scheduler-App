import { useState, useEffect } from 'react'
import CreateMeeting from '../../components/Meeting/CreateMeeting'
import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'


const Meeting = () => {

  const { meeting, error, loading } = useMeeting()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('organized') // 'organized' | 'participating'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [organizedMeetings, setOrganizedMeetings] = useState(initialOrganizedMeetings)


  // Filtered organized meetings
  const filteredOrganized = organizedMeetings.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Filtered participating meetings
  const filteredParticipating = initialParticipatingMeetings.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.host.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="w-full bg-[#F9FAFB] min-h-[calc(100vh-65px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Meetings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage scheduled calls, invitations, and team syncs across your channels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl shadow-xs transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Availability</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition cursor-pointer group"
            >
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Create Meeting</span>
            </button>
          </div>
        </div>

        {/* Filter, Search & Tabs Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b lg:border-b-0 border-slate-100 pb-2 lg:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('organized')}
                className={`relative pb-2 font-semibold text-sm transition flex items-center gap-2 cursor-pointer ${activeTab === 'organized'
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <span>Organized by me</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {organizedMeetings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('participating')}
                className={`relative pb-2 font-semibold text-sm transition flex items-center gap-2 cursor-pointer ${activeTab === 'participating'
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <span>Participating</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {initialParticipatingMeetings.length}
                </span>
              </button>
            </div>

            {/* Search & Status Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by meeting title or participant..."
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              <div className="relative w-full sm:w-44">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <svg className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ORGANIZED VIEW */}
        {activeTab === 'organized' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrganized.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">No organized meetings match your current filters.</p>
              </div>
            ) : (
              filteredOrganized.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Header Status & Platform */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        {meeting.status === 'scheduled' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Scheduled
                          </span>
                        )}
                        {meeting.status === 'completed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            Completed
                          </span>
                        )}
                        {meeting.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium text-xs border border-red-200">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Cancelled
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100">
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                          {meeting.platform}
                        </span>
                      </div>

                      <span className={`text-xs font-medium ${meeting.status === 'cancelled' ? 'text-red-500' : 'text-slate-500'}`}>
                        {meeting.host}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 mb-2 ${meeting.status === 'cancelled' ? 'line-through text-slate-400' : ''
                      }`}>
                      {meeting.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-4">
                      {meeting.description}
                    </p>

                    {/* Date & Time Box */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2.5 px-3.5 bg-slate-50 rounded-xl mb-4 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                        <span>{meeting.time}</span>
                      </div>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                        <span>{meeting.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {meeting.avatars?.map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt="Attendee"
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {meeting.participantsCount} participants
                      </span>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition py-1.5 px-2 cursor-pointer"
                      >
                        <span>View Details</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </button>

                      {/* 3-dots Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === meeting.id ? null : meeting.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                        </button>

                        {activeMenuId === meeting.id && (
                          <div
                            className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 flex flex-col gap-0.5"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(null)}
                              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                              Edit Meeting
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOrganizedMeetings(organizedMeetings.map(m => m.id === meeting.id ? { ...m, status: 'completed' } : m))
                                setActiveMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-emerald-700 hover:bg-emerald-50 text-xs font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                              Mark Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOrganizedMeetings(organizedMeetings.map(m => m.id === meeting.id ? { ...m, status: 'cancelled' } : m))
                                setActiveMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                              </svg>
                              Cancel Meeting
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PARTICIPATING VIEW */}
        {activeTab === 'participating' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredParticipating.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-500 text-sm">No participating meetings found.</p>
              </div>
            ) : (
              filteredParticipating.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Scheduled
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Host: {item.host}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mb-4">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 py-2.5 px-3.5 bg-slate-50 rounded-xl mb-4 text-xs font-medium text-slate-700">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      <span>{item.time} ({item.duration})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">{item.attendeesInfo}</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <span>View Invite</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CREATE MEETING MODAL */}
      <CreateMeeting
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  )
}

export default Meeting