import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Check, ChevronDown, ChevronRight, CircleCheck, CircleX, ClipboardList, Clock, Copy, ExternalLink, Link2, LoaderCircle, Plus, Search, Send, SquarePen, Trash, TriangleAlert, Users, Video, X } from 'lucide-react';
import { useMeeting } from '../../context/MeetingContextProvider'
import { useAuth } from '../../context/AuthContextProvider'
import {
  getMeetingParticipants,
  addMeetingParticipant,
  deleteMeetingParticipant,
} from '../../services/meetingApi'
import { formatDateTime, formatDuration } from '../../utils/format'
import EditMeeting from '../../components/Meeting/EditMeeting'

const getInitials = (email = '') => {
  const parts = email.split('@')[0].split(/[._-]/)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || email[0]?.toUpperCase() || '?'
}

const avatarColors = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
  'bg-amber-600 text-white',
]
const avatarColor = (email = '') => avatarColors[(email.charCodeAt(0) || 0) % avatarColors.length]

const StatusBadge = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-red-200 bg-red-50 text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" /> Cancelled
      </span>
    )
  }
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-slate-100 text-slate-600">
        <span className="h-2 w-2 rounded-full bg-slate-400" /> Completed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Scheduled
    </span>
  )
}

const RsvpBadge = ({ rsvp }) => {
  if (rsvp === 'accepted') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
        <Check className="h-3 w-3" strokeWidth={3} />
        Accepted
      </span>
    )
  }
  if (rsvp === 'declined') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold border border-red-100">
        <X className="h-3 w-3" strokeWidth={3} />
        Declined
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  )
}

// -------

const MeetingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    singleMeeting: meetingData,
    singleLoading: pageLoading,
    singleError: pageError,
    actionLoading,
    MeetingSingleGet,
    MeetingCancel,
    MeetingComplete,
    MeetingDelete,
    clearSingleMeeting,
  } = useMeeting()
  const { user } = useAuth()

  const [participants, setParticipants] = useState([])
  const [toast, setToast] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [agendaOpen, setAgendaOpen] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Participant filtering & quick invite
  const [searchParticipant, setSearchParticipant] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3200)
  }

  // Meeting fetch lives in context; here we only load participants alongside it.
  const fetchParticipants = async () => {
    try {
      const partRes = await getMeetingParticipants(id)
      setParticipants(partRes?.data || [])
    } catch {
      setParticipants([])
    }
  }

  useEffect(() => {
    if (!id) return
    MeetingSingleGet(id).catch(() => {
      // error is stored in context as singleError
    })
    fetchParticipants()
    return () => clearSingleMeeting?.()
  }, [id])

  const handleCopyLink = () => {
    if (!meetingData?.meeting_link) return
    navigator.clipboard?.writeText(meetingData.meeting_link)
    setCopiedLink(true)
    showToast('Meeting link copied to clipboard')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleAction = async (actionType) => {
    try {
      if (actionType === 'cancel') {
        await MeetingCancel(id)
        showToast('Meeting has been cancelled.')
      } else {
        await MeetingComplete(id)
        showToast('Meeting marked as completed.')
      }
      // context already syncs single + list status; just refresh participants view
      fetchParticipants()
    } catch (err) {
      const data = err.response?.data
      showToast(data?.error || data?.detail || `Failed to ${actionType} meeting`, true)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${meetingData?.title}"? This cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await MeetingDelete(id)
      navigate('/meeting')
    } catch (err) {
      const data = err.response?.data
      showToast(data?.detail || data?.error || 'Failed to delete meeting', true)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleQuickInvite = async (e) => {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) return
    setInviteLoading(true)
    try {
      await addMeetingParticipant(id, email)
      showToast(`Invitation sent to ${email}`)
      setInviteEmail('')
      const partRes = await getMeetingParticipants(id)
      setParticipants(partRes?.data || [])
    } catch (err) {
      const data = err.response?.data
      showToast(data?.email?.[0] || data?.detail || 'Failed to invite participant', true)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemoveParticipant = async (participantId, email) => {
    if (!window.confirm(`Remove ${email} from this meeting?`)) return
    try {
      await deleteMeetingParticipant(id, participantId)
      showToast(`Removed ${email}`)
      setParticipants((prev) => prev.filter((p) => p.id !== participantId))
    } catch (err) {
      const data = err.response?.data
      showToast(data?.detail || 'Failed to remove participant', true)
    }
  }

  const isOrganizer = meetingData?.user_role === 'organizer'

  // ── loading ──
  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading meeting details...</p>
        </div>
      </div>
    )
  }

  // ── error ──
  if (pageError) {
    return (
      <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md w-full">
          <TriangleAlert className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="text-base font-bold text-red-800 mb-1">Could not load meeting</h2>
          <p className="text-sm text-red-600 mb-4">{pageError}</p>
          <Link to="/meeting" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" /> Back to Meetings
          </Link>
        </div>
      </div>
    )
  }

  if (!meetingData) return null

  const { date: startDate, time: startTime } = formatDateTime(meetingData.start_datetime)
  const { date: endDate, time: endTime } = formatDateTime(meetingData.end_datetime)
  const isMultiDay = Boolean(endDate) && endDate !== startDate
  const duration = formatDuration(meetingData.duration)
  const isCancelled = meetingData.status === 'cancelled'
  const isScheduled = meetingData.status === 'scheduled'

  // RSVP stats
  const accepted = participants.filter((p) => p.rsvp_status === 'accepted').length
  const declined = participants.filter((p) => p.rsvp_status === 'declined').length
  const pending = participants.filter((p) => p.rsvp_status === 'pending').length
  const total = participants.length
  const acceptedPct = total > 0 ? Math.round((accepted / total) * 100) : 0
  const declinedPct = total > 0 ? Math.round((declined / total) * 100) : 0
  const pendingPct = total > 0 ? 100 - acceptedPct - declinedPct : 0

  const filteredParticipants = participants.filter((p) =>
    p.email?.toLowerCase().includes(searchParticipant.toLowerCase())
  )

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">

        {/* ── Breadcrumb & Header ── */}
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/meeting" className="hover:text-blue-600 transition-colors">Meetings</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-700 font-medium truncate max-w-xs">{meetingData.title}</span>
          </div>

          {/* Title + action bar */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {meetingData.title}
                </h1>
                <StatusBadge status={meetingData.status} />
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {isOrganizer ? 'Organized by you' : 'Invited meeting'}
                </span>
              </div>
            </div>

            {/* Action Buttons — organizer only */}
            {isOrganizer && isScheduled && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium shadow-sm hover:bg-blue-100 transition disabled:opacity-50 cursor-pointer"
                >
                  <SquarePen className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('complete')}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                >
                  <CircleCheck className="h-4 w-4 text-emerald-600" />
                  {actionLoading === 'complete' ? 'Saving...' : 'Mark Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('cancel')}
                  disabled={!!actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium shadow-sm hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
                >
                  <CircleX className="h-4 w-4" />
                  {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Meeting'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!!actionLoading || isDeleting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT COLUMN (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Meeting Overview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-5">
              {/* Date/Time row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{startDate}</p>
                    <p className="text-sm text-slate-500">
                      {startTime}{endTime ? ` – ${endTime}` : ''}{duration ? ` (${duration})` : ''}
                    </p>
                    {isMultiDay && (
                      <p className="text-xs text-slate-500">Ends {endDate}</p>
                    )}
                  </div>
                </div>
                {/* Platform badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 w-fit">
                  <Video className="h-3.5 w-3.5 text-blue-600" />
                  {meetingData.location_type === 'google_meet' ? 'Google Meet' : 'Zoom'}
                </span>
              </div>

              {/* Meeting link banner */}
              {meetingData.meeting_link ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-0.5">Video Conference Link</p>
                      <a href={meetingData.meeting_link} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-700 hover:underline truncate block max-w-xs">
                        {meetingData.meeting_link}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <a
                      href={meetingData.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Join Meeting
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  <LoaderCircle className="h-4 w-4 text-slate-400 animate-spin" />
                  Meeting link is being generated — check back shortly.
                </div>
              )}

              {/* Description */}
              {meetingData.description && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Context &amp; Objectives</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{meetingData.description}</p>
                </div>
              )}

              {/* Organizer line */}
              <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(user?.email || '')}`}>
                  {getInitials(user?.email || '')}
                </div>
                <span className="text-xs text-slate-500">
                  {isOrganizer ? (
                    <>Organized by <strong className="text-slate-800 font-semibold">{user?.first_name || user?.email?.split('@')[0]}</strong> (you)</>
                  ) : (
                    'You are invited to this meeting'
                  )}
                </span>
              </div>
            </div>

            {/* Collapsible Agenda Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/60 transition select-none"
                onClick={() => setAgendaOpen((v) => !v)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-slate-900">Meeting Agenda</h2>
                    <p className="text-xs text-slate-500">
                      {meetingData.agenda ? 'Agenda available' : 'No agenda set'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${agendaOpen ? 'rotate-180' : ''}`} />
              </button>

              {agendaOpen && (
                <div className="px-6 pb-6">
                  {meetingData.agenda ? (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {meetingData.agenda}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 text-center text-slate-400">
                      <ClipboardList className="mb-2 h-8 w-8" />
                      <p className="text-sm font-medium text-slate-600">No agenda added</p>
                      <p className="text-xs text-slate-400 mt-0.5">The organizer hasn't set an agenda yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Notes Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/60 transition select-none"
                onClick={() => setNotesOpen((v) => !v)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <SquarePen className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-slate-900">Meeting Notes &amp; Outcomes</h2>
                    <p className="text-xs text-slate-500">Post-meeting notes and action items</p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${notesOpen ? 'rotate-180' : ''}`} />
              </button>

              {notesOpen && (
                <div className="px-6 pb-6">
                  {meetingData.meeting_notes ? (
                    <div className="rounded-xl bg-amber-50/60 border border-amber-100 px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {meetingData.meeting_notes}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <SquarePen className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">No notes yet</p>
                      <p className="text-xs text-slate-400 mt-0.5">Notes will appear here after the meeting.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN (5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* RSVP Summary Card */}
            {participants.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">RSVP Status</h2>
                  <span className="text-xs font-semibold text-emerald-600">{acceptedPct}% Confirmed</span>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${acceptedPct}%` }} />
                    <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${pendingPct}%` }} />
                    <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${declinedPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <strong className="text-slate-800">{accepted}</strong> Accepted
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                      <strong className="text-slate-800">{pending}</strong> Pending
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <strong className="text-slate-800">{declined}</strong> Declined
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Participants Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Participants</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {participants.length}
                  </span>
                </div>

                {participants.length > 2 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchParticipant}
                      onChange={(e) => setSearchParticipant(e.target.value)}
                      className="w-full sm:w-36 pl-8 pr-2.5 py-1 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>
                )}
              </div>

              {filteredParticipants.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <Users className="mx-auto mb-2 h-7 w-7" />
                  <p className="text-sm text-slate-500">
                    {searchParticipant ? 'No matching participants' : 'No participants yet'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-50">
                  {filteredParticipants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3 group first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${avatarColor(p.email)}`}>
                          {getInitials(p.email)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900 truncate">{p.email}</span>
                            <RsvpBadge rsvp={p.rsvp_status} />
                          </div>
                          {p.invited_at && (
                            <span className="text-[11px] text-slate-400">
                              Invited {new Date(p.invited_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove button — organizer only */}
                      {isOrganizer && isScheduled && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(p.id, p.email)}
                          title="Remove participant"
                          className="p-1.5 rounded-lg text-slate-400 opacity-60 hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Invite Card — organizer only */}
            {isOrganizer && isScheduled && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Quick Invite</h2>
                </div>
                <p className="text-xs text-slate-500">
                  Send an invitation link directly to an external participant.
                </p>

                <form onSubmit={handleQuickInvite} className="flex flex-col sm:flex-row items-center gap-2 mt-1">
                  <input
                    type="email"
                    required
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition"
                  />
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {inviteLoading ? (
                      <>
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        <span>Inviting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Invite</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Meeting Meta Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-3">
              <h2 className="text-sm font-bold text-slate-900">Meeting Info</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-xs text-slate-500">Status</span>
                  <StatusBadge status={meetingData.status} />
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-xs text-slate-500">Platform</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {meetingData.location_type === 'google_meet' ? 'Google Meet' : 'Zoom'}
                  </span>
                </div>
                {duration && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-500">Duration</span>
                    <span className="text-xs font-semibold text-slate-700">{duration}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="text-xs text-slate-500">Your role</span>
                  <span className={`text-xs font-semibold ${isOrganizer ? 'text-blue-600' : 'text-slate-700'}`}>
                    {isOrganizer ? 'Organizer' : 'Participant'}
                  </span>
                </div>
                {meetingData.created_at && (
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-500">Created</span>
                    <span className="text-xs text-slate-600">
                      {new Date(meetingData.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 shadow-xl transition-all text-sm font-medium ${toast.isError ? 'bg-red-900 text-white' : 'bg-slate-900 text-white'}`}>
          {toast.isError ? (
            <TriangleAlert className="h-4 w-4 text-red-400 shrink-0" />
          ) : (
            <CircleCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Edit modal — organizer only */}
      {isOrganizer && isScheduled && (
        <EditMeeting
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          meeting={meetingData}
        />
      )}
    </div>
  )
}

export default MeetingDetail