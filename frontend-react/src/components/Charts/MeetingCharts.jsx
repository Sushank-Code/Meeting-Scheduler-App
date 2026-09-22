import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip)

const getWeekStart = (date) => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}

const MeetingCharts = ({ meetings }) => {
  const currentWeek = getWeekStart(new Date())
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const week = new Date(currentWeek)
    week.setDate(currentWeek.getDate() - (7 * (7 - index)))
    return week
  })

  const organized = Array(8).fill(0)
  const participated = Array(8).fill(0)

  meetings.forEach((meeting) => {
    if (!meeting.created_at) return
    const week = getWeekStart(new Date(meeting.created_at))
    const index = weeks.findIndex((item) => item.getTime() === week.getTime())
    if (index === -1) return
    if (meeting.user_role === 'organizer') organized[index] += 1
    if (meeting.user_role === 'participant') participated[index] += 1
  })

  const statusCount = (status) => meetings.filter((meeting) => meeting.status === status).length
  const scheduled = statusCount('scheduled')
  const completed = statusCount('completed')
  const cancelled = statusCount('cancelled')

  const lineData = {
    labels: weeks.map((week) => week.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Organized',
        data: organized,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'Participated',
        data: participated,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  }

  const doughnutData = {
    labels: ['Scheduled', 'Completed', 'Cancelled'],
    datasets: [{ data: [scheduled, completed, cancelled], backgroundColor: ['#047857', '#64748b', '#dc2626'], borderWidth: 0 }],
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-8">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Meetings per Week</h2>
          <p className="text-sm text-slate-500">Throughput across the last 8 calendar weeks</p>
        </div>
        <div className="h-64">
          <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', align: 'end', labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true } } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e8efff' } }, x: { grid: { display: false } } } }} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-4">
        <h2 className="text-xl font-bold text-slate-900">Status Distribution</h2>
        <p className="text-sm text-slate-500">Breakdown of meeting dispositions</p>
        <div className="relative mx-auto mt-5 h-52 w-52">
          <Doughnut
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '72%',
              plugins: { legend: { display: false } },
            }}
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <strong className="text-3xl text-slate-900">{meetings.length}</strong>
            <span className="text-xs text-slate-500">Total Meetings</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-600">
          <span><b className="text-emerald-700">{scheduled}</b><br />Scheduled</span>
          <span><b className="text-slate-700">{completed}</b><br />Completed</span>
          <span><b className="text-red-700">{cancelled}</b><br />Cancelled</span>
        </div>
      </div>
    </section>
  )
}

export default MeetingCharts
