import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, CalendarDays, Check, CircleCheck, Clock, Copy, LoaderCircle, TriangleAlert, Video, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'
import { useParticipant } from '../../context/ParticipantContextProvider'
import { getMeetingParticipants } from '../../services/participantApi'
import { formatDateTime, formatDuration, platformName } from '../../utils/format'
import RsvpStatusBadge from '../../components/Rsvp/RsvpStatusBadge'

const initials = (name = '') =>
  name.trim().split(/[\s._@-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'

const localTz = () => {
  try {
    return new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()
  } catch {
    return ''
  }
}

const gcalLink = (meeting) => {
  const stamp = (v) => new Date(v).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title || 'Meeting',
    dates: `${stamp(meeting.start_datetime)}/${stamp(meeting.end_datetime)}`,
    details: meeting.description || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const Rsvp = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { singleMeeting: meeting, singleLoading, singleError, MeetingSingleGet, clearSingleMeeting } = useMeeting()
  const { RsvpUpdate } = useParticipant()

  const [myStatus, setMyStatus] = useState('pending')
  const [responding, setResponding] = useState(null) // 'accepted' | 'declined' | null
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3200)
  }

  useEffect(() => {
    if (!id) return
    MeetingSingleGet(id).catch(() => {})
    // resolve my own RSVP row for this meeting (read-only lookup)
    if (user?.email) {
      getMeetingParticipants(id)
        .then((res) => {
          const mine = (res?.data || []).find(
            (p) => p.email?.toLowerCase() === user.email.toLowerCase()
          )
          if (mine?.rsvp_status) setMyStatus(mine.rsvp_status)
        })
        .catch(() => {})
    }
    return () => clearSingleMeeting?.()
  }, [id])

  const handleRespond = async (status) => {
    setResponding(status)
    try {
      await RsvpUpdate(id, status)
      setMyStatus(status)
      showToast(status === 'accepted' ? 'You accepted the invitation.' : 'You declined the invitation.')
    } catch (err) {
      const data = err.response?.data
      showToast(data?.rsvp_status?.[0] || data?.detail || 'Failed to send your response', true)
    } finally {
      setResponding(null)
    }
  }

  const handleCopy = () => {
    if (!meeting?.meeting_link) return
    navigator.clipboard?.writeText(meeting.meeting_link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (singleLoading) {
    return (
      <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading your invitation...</p>
        </div>
      </div>
    )
  }

  if (singleError) {
    return (
      <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md w-full">
          <TriangleAlert className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="text-base font-bold text-red-800 mb-1">Could not load invitation</h2>
          <p className="text-sm text-red-600 mb-4">{singleError}</p>
          <Link to="/my-rsvp" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Back to My RSVP
          </Link>
        </div>
      </div>
    )
  }

  if (!meeting) return null

  const { date: startDate, time: startTime } = formatDateTime(meeting.start_datetime)
  const { time: endTime } = formatDateTime(meeting.end_datetime)
  const duration = formatDuration(meeting.duration)
  const tz = localTz()
  const isCancelled = meeting.status === 'cancelled'
  const isCompleted = meeting.status === 'completed'
  const isOrganizer = meeting.user_role === 'organizer'
  const canRespond = !isOrganizer && !isCancelled && !isCompleted
  const agendaLines = (meeting.agenda || '').split('\n').map((l) => l.trim()).filter(Boolean)

  return (
    <div
      className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-10 sm:px-6"
      style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '22px 22px' }}
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="text-base font-bold text-slate-900">MeetSync Invite</span>
          </div>
          <RsvpStatusBadge status={myStatus} />
        </div>

        <div className="px-6 sm:px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">You are invited to:</p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {meeting.title}
          </h1>

          {/* Organizer row (omitted when the API has no organizer info) */}
          {(meeting.organizer_name || meeting.organizer_email) && (
            <div className="mt-4 flex items-center gap-3">
              {meeting.organizer_avatar ? (
                <img
                  src={meeting.organizer_avatar}
                  alt={meeting.organizer_name || meeting.organizer_email}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {initials(meeting.organizer_name || meeting.organizer_email)}
                </span>
              )}
              <div>
                <p className="text-sm text-slate-900">
                  Organized by <strong>{meeting.organizer_name || meeting.organizer_email}</strong>
                </p>
                {meeting.organizer_name && meeting.organizer_email && (
                  <p className="text-sm text-blue-600">{meeting.organizer_email}</p>
                )}
              </div>
            </div>
          )}

          {/* Schedule + platform panel */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-blue-600" />
              <p className="font-semibold text-slate-900">{startDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-slate-700">
                {startTime} – {endTime} {tz}
                {duration && <span className="text-slate-500"> ({duration})</span>}
              </p>
            </div>
            <p className="w-fit rounded-md border border-blue-100 bg-blue-50/60 px-2.5 py-1 text-xs font-medium text-blue-700">
              Converted to your local time ({tz || 'local'})
            </p>

            <div className="border-t border-slate-200/70" />

            {isCancelled ? (
              <p className="flex items-center gap-2 text-sm font-medium text-red-700">
                <X className="h-4 w-4" /> This meeting was cancelled — the link is no longer active.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-emerald-600" />
                  <p className="font-semibold text-slate-900">{platformName(meeting.location_type)}</p>
                </div>
                {meeting.meeting_link ? (
                  <>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <span className="truncate font-mono text-xs text-slate-600">{meeting.meeting_link}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">Link activates 10 min before start</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Meeting link is being generated — check back shortly.</p>
                )}
              </>
            )}

            {agendaLines.length > 0 && (
              <>
                <div className="border-t border-slate-200/70" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Agenda Preview</p>
                  <ol className="mt-2 flex flex-col gap-1.5">
                    {agendaLines.map((line, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                        <span className="font-semibold text-slate-400">{i + 1}.</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}
          </div>

          {/* Response area */}
          {isOrganizer ? (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">You organized this meeting.</p>
              <Link to={`/meeting/${meeting.meeting_id}`} className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
                Manage it from the detail page
              </Link>
            </div>
          ) : isCancelled || isCompleted ? (
            <p className="mt-8 text-center text-sm text-slate-500">
              This meeting is {meeting.status} — responses are closed.
            </p>
          ) : (
            canRespond && (
              <div className="mt-8">
                {myStatus === 'accepted' ? (
                  <p className="flex items-center justify-center gap-2 text-center text-sm font-bold text-emerald-700">
                    <CircleCheck className="h-5 w-5" /> You're going — you accepted this invitation.
                  </p>
                ) : myStatus === 'declined' ? (
                  <p className="flex items-center justify-center gap-2 text-center text-sm font-bold text-red-600">
                    <X className="h-5 w-5" strokeWidth={3} /> You've declined this invitation.
                  </p>
                ) : (
                  <>
                    <p className="text-center text-lg font-bold text-slate-900">Will you be attending?</p>
                    <p className="mt-1 text-center text-sm text-slate-500">
                      Your response will notify the organizer immediately.
                    </p>
                  </>
                )}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!!responding}
                    onClick={() => handleRespond('accepted')}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer ${myStatus === 'accepted' ? 'ring-2 ring-emerald-800 ring-offset-2' : ''}`}
                  >
                    {responding === 'accepted'
                      ? <LoaderCircle className="h-4 w-4 animate-spin" />
                      : <Check className="h-4 w-4" strokeWidth={3} />}
                    {responding === 'accepted' ? 'Accepting...' : 'Accept Invitation'}
                  </button>
                  <button
                    type="button"
                    disabled={!!responding}
                    onClick={() => handleRespond('declined')}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-bold transition disabled:opacity-50 cursor-pointer ${myStatus === 'declined'
                      ? 'border-red-600 bg-red-600 text-white shadow-sm hover:bg-red-700 ring-2 ring-red-300 ring-offset-2'
                      : 'border-red-200 bg-white text-red-600 hover:bg-red-50'
                      }`}
                  >
                    {responding === 'declined'
                      ? <LoaderCircle className="h-4 w-4 animate-spin" />
                      : <X className="h-4 w-4" strokeWidth={3} />}
                    {responding === 'declined' ? 'Declining...' : 'Decline'}
                  </button>
                </div>
                {myStatus !== 'pending' && (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Changed your mind? Choose the other option — your response updates instantly.
                  </p>
                )}
              </div>
            )
          )}
        </div>

        {/* Calendar footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-center text-xs text-slate-500">
          Add to:{' '}
          <a
            href={gcalLink(meeting)}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-700 hover:text-blue-700"
          >
            Google Calendar
          </a>
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
    </div>
  )
}

export default Rsvp
