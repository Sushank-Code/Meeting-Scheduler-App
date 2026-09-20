import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'

const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Date not available'

const platformName = (locationType) => locationType === 'google_meet' ? 'Google Meet' : 'Zoom'

const Dashboard = () => {
  const { user } = useAuth()
  const { meeting, loading, error } = useMeeting()
  const meetings = Array.isArray(meeting) ? meeting : meeting?.results || []
  const displayName = user?.first_name || user?.email?.split('@')[0] || 'there'
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)

  const organizedMeetings = meetings.filter((item) => item.user_role === 'organizer')
  const participatingMeetings = meetings.filter((item) => item.user_role === 'participant')
  const upcomingMeetings = meetings
    .filter((item) => item.status === 'scheduled' && new Date(item.start_datetime) >= now && new Date(item.start_datetime) <= nextWeek)
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, <span className="font-semibold capitalize text-slate-700">{displayName}</span>.
            </p>
          </div>
          <Link to="/meeting" className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:self-auto">
            View meetings
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Organized</p>
            <p className="mt-3 text-3xl font-extrabold text-blue-600">{organizedMeetings.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Participating</p>
            <p className="mt-3 text-3xl font-extrabold text-blue-600">{participatingMeetings.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Upcoming this week</p>
            <p className="mt-3 text-3xl font-extrabold text-blue-600">{upcomingMeetings.length}</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Upcoming Meetings</h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Next 7 days
            </span>
          </div>

          {loading && <p className="py-8 text-center text-sm text-slate-500">Loading meetings...</p>}
          {!loading && error && <p className="py-8 text-center text-sm text-red-600">{error}</p>}
          {!loading && !error && upcomingMeetings.length === 0 && (
            <div className="py-10 text-center">
              <p className="font-medium text-slate-800">No upcoming meetings</p>
              <p className="mt-1 text-sm text-slate-500">Your next scheduled meeting will appear here.</p>
            </div>
          )}

          {!loading && !error && upcomingMeetings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <th className="rounded-l-lg px-4 py-3">Meeting</th>
                    <th className="px-4 py-3">Date & time</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="rounded-r-lg px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {upcomingMeetings.map((item) => (
                    <tr key={item.meeting_id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.user_role === 'organizer' ? 'Organized by you' : 'Invited meeting'}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDateTime(item.start_datetime)}</td>
                      <td className="px-4 py-4 text-slate-600">{platformName(item.location_type)}</td>
                      <td className="px-4 py-4 text-right">
                        <Link to={`/meeting/${item.meeting_id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
