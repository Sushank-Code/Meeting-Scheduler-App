import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Check, CircleCheck, Inbox, LoaderCircle, TriangleAlert, Video, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'
import { useParticipant } from '../../context/ParticipantContextProvider'
import { getMeetingParticipants } from '../../services/participantApi'
import { formatDateTime, formatDuration, platformName } from '../../utils/format'
import RsvpStatusBadge from '../../components/Rsvp/RsvpStatusBadge'

const filters = ['all', 'pending', 'accepted', 'declined']

const MyRsvp = () => {
  const { user } = useAuth()
  const { meeting, loading } = useMeeting()
  const { RsvpUpdate } = useParticipant()

  const [statusMap, setStatusMap] = useState({})
  const [resolving, setResolving] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [respondingId, setRespondingId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3200)
  }

  // meetings where I am invited (not the organizer)
  const invitations = useMemo(() => {
    const list = Array.isArray(meeting) ? meeting : meeting?.results || []
    return list.filter((m) => m.user_role === 'participant')
  }, [meeting])

  // the list API carries no per-user RSVP state, so resolve mine
  // from each meeting's participant rows (read-only, no context state touched)
  useEffect(() => {
    if (!invitations.length || !user?.email) return
    let cancelled = false
    const resolveStatuses = async () => {
      setResolving(true)
      const entries = await Promise.all(
        invitations.map(async (m) => {
          try {
            const res = await getMeetingParticipants(m.meeting_id)
            const mine = (res?.data || []).find(
              (p) => p.email?.toLowerCase() === user.email.toLowerCase()
            )
            return [m.meeting_id, mine?.rsvp_status || 'pending']
          } catch {
            return [m.meeting_id, 'pending']
          }
        })
      )
      if (!cancelled) {
        setStatusMap(Object.fromEntries(entries))
        setResolving(false)
      }
    }
    resolveStatuses()
    return () => { cancelled = true }
  }, [invitations, user?.email])

  const handleRespond = async (meetingId, status) => {
    setRespondingId(meetingId)
    try {
      await RsvpUpdate(meetingId, status)
      setStatusMap((prev) => ({ ...prev, [meetingId]: status }))
      showToast(status === 'accepted' ? 'Invitation accepted.' : 'Invitation declined.')
    } catch (err) {
      const data = err.response?.data
      showToast(data?.rsvp_status?.[0] || data?.detail || 'Failed to update RSVP', true)
    } finally {
      setRespondingId(null)
    }
  }

  const visible = invitations.filter((m) =>
    activeFilter === 'all' ? true : (statusMap[m.meeting_id] || 'pending') === activeFilter
  )

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading your invitations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">My RSVP</h1>
            <p className="mt-1 text-sm text-slate-500">
              {invitations.length} invitation{invitations.length === 1 ? '' : 's'} from other organizers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${activeFilter === f
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              {invitations.length === 0 ? 'No invitations yet' : `No ${activeFilter} invitations`}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              When someone invites you to a meeting, it will show up here.
            </p>
            <Link to="/meeting" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
              Go to Meetings
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((m) => {
              const { date, time } = formatDateTime(m.start_datetime)
              const { time: endTime } = formatDateTime(m.end_datetime)
              const status = statusMap[m.meeting_id] || 'pending'
              const busy = respondingId === m.meeting_id
              return (
                <article key={m.meeting_id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/meeting/${m.meeting_id}`} className="font-bold text-slate-900 hover:text-blue-700 truncate">
                          {m.title}
                        </Link>
                        <RsvpStatusBadge status={status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {date} · {time}{endTime ? ` – ${endTime}` : ''}
                      </p>
                      {(m.organizer_name || m.organizer_email) && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Invited by <span className="font-semibold text-slate-700">{m.organizer_name || m.organizer_email}</span>
                        </p>
                      )}
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Video className="h-3.5 w-3.5 text-slate-400" />
                        {platformName(m.location_type)}
                        {formatDuration(m.duration) ? ` · ${formatDuration(m.duration)}` : ''}
                        {resolving && <span className="text-slate-400">· syncing status...</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/rsvp/${m.meeting_id}`}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      View Invite
                    </Link>
                    {status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleRespond(m.meeting_id, 'accepted')}
                          title="Accept invitation"
                          className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50 cursor-pointer"
                        >
                          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={3} />}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleRespond(m.meeting_id, 'declined')}
                          title="Decline invitation"
                          className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50 cursor-pointer"
                        >
                          <X className="h-4 w-4" strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <span className={`px-1 text-xs font-semibold ${status === 'accepted' ? 'text-emerald-700' : 'text-red-600'}`}>
                        You have {status}
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
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

export default MyRsvp
