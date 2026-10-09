import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, UserRoundCheck } from 'lucide-react'
import MeetingCharts from '../../components/Charts/MeetingCharts'
import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'

const formatDateTime = (value) => { 
  if (!value) return 'Date not available'
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

const platformName = (locationType) => locationType === 'google_meet' ? 'Google Meet' : 'Zoom'

const Dashboard = () => {
  const { user } = useAuth()
  const { meeting, loading, error } = useMeeting()
  const meetings = Array.isArray(meeting) ? meeting : meeting?.results || []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  nextWeek.setHours(23, 59, 59, 999)

  const organizedMeetings = meetings.filter((item) => item.user_role === 'organizer')
  const participatingMeetings = meetings.filter((item) => item.user_role === 'participant')
  const upcomingMeetings = meetings
    .filter((item) => {
      const startDate = new Date(item.start_datetime)
      return item.status === 'scheduled' && startDate >= today && startDate <= nextWeek
    })
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
  const upcomingToday = meetings.filter((item) => {
    const startDate = new Date(item.start_datetime)
    return item.status === 'scheduled' && startDate.toDateString() === today.toDateString()
  })
  const cancelledMeetings = meetings.filter((item) => item.status === 'cancelled')

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, <span className="font-semibold capitalize text-slate-700">{user?.username}</span>.
            </p>
          </div>
          <Link
            to="/meeting"
            className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:self-auto"
          >
            View meetings
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Organized */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-700">Organized Meetings</p>
              <p className="mt-5 text-4xl font-extrabold text-slate-900">{organizedMeetings.length}</p>
              <p className="mt-1 text-sm text-slate-600">Hosted across your platforms</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarDays className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Participating */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-700">Participating</p>
              <p className="mt-5 text-4xl font-extrabold text-slate-900">{participatingMeetings.length}</p>
              <p className="mt-1 text-sm text-slate-600">Invited as attendee</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <UserRoundCheck className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Upcoming today */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-700">Upcoming Today</p>
              <p className="mt-5 text-4xl font-extrabold text-slate-900">{upcomingToday.length}</p>
              <p className="mt-1 text-sm text-slate-600">Scheduled for today</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Clock3 className="h-6 w-6" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:shadow-md">
            <div>
              <p className="text-sm font-medium text-slate-700">Cancelled</p>
              <p className="mt-5 text-4xl font-extrabold text-red-600">{cancelledMeetings.length}</p>
              <p className="mt-1 text-sm text-slate-600">Meetings no longer active</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-600">!</div>
          </div>
        </section>

        <MeetingCharts meetings={meetings} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                    <th className="px-4 py-3">Meeting</th>
                    <th className="px-4 py-3">Date &amp; time</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {upcomingMeetings.map((item) => (
                    <tr key={item.meeting_id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
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
