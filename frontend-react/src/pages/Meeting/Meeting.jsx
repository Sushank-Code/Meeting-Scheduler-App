import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import CreateMeeting from '../../components/Meeting/CreateMeeting'
import { useMeeting } from '../../context/MeetingContextProvider'

const formatDuration = (duration) => {
  if (!duration) return null

  if (/^\d+(\.\d+)?$/.test(String(duration))) {
    const totalMinutes = Math.round(Number(duration) / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const [hours, minutes] = String(duration).split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return duration

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

const platformName = (locationType) => locationType === 'google_meet' ? 'Google Meet' : 'Zoom'

const statusClasses = {
  scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const Meeting = () => {
  const { meeting, error, loading, MeetingGet } = useMeeting()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const meetings = Array.isArray(meeting) ? meeting : meeting?.results || []

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Meetings</h1>
            <p className="mt-1 text-sm text-slate-500">Your organized and invited meetings.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
            Create Meeting
          </button>
        </header>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading meetings...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && meetings.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-medium text-slate-800">No meetings yet</p>
            <p className="mt-1 text-sm text-slate-500">Meetings you organize or are invited to will appear here.</p>
          </div>
        )}

        {!loading && !error && meetings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {meetings.map((item) => {
              const isCancelled = item.status === 'cancelled'

              return (
                <article key={item.meeting_id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusClasses[item.status] || statusClasses.scheduled}`}>
                        <span className={`h-2 w-2 rounded-full ${isCancelled ? 'bg-red-500' : item.status === 'completed' ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                        {item.status || 'scheduled'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {item.user_role === 'organizer' ? 'Organized by you' : 'Invited meeting'}
                      </span>
                    </div>

                    <h2 className={`mb-2 text-lg font-bold ${isCancelled ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {item.title}
                    </h2>

                    {item.description && <p className="mb-4 text-sm text-slate-500">{item.description}</p>}

                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-xs font-medium text-slate-700"> Duration :
                      <span>{formatDuration(item.duration)}</span> /
                      <span>{platformName(item.location_type)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <Link to={`/meeting/${item.meeting_id}`} className="text-xs font-semibold text-blue-600 transition hover:text-blue-700">
                      View Details
                    </Link>

                    {isCancelled ? (
                      <span className="text-xs font-semibold text-slate-400">Meeting cancelled</span>
                    ) : item.meeting_link ? (
                      <a href={item.meeting_link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 transition hover:text-blue-700">
                        Join Meeting →
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Link pending</span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <CreateMeeting
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMeetingCreated={MeetingGet}
      />
    </div>
  ) 
}

export default Meeting
