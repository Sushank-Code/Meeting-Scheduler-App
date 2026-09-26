import { useState, useEffect } from 'react'
import { Check, CircleCheck, Clock3, LoaderCircle, PencilLine, Video, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'

const CreateMeeting = ({ isOpen, onClose, onMeetingCreated }) => {
  const { user } = useAuth()
  const { MeetingPost, loading, error } = useMeeting()

  const { register, handleSubmit, formState: { errors } } = useForm({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    platform: 'google_meet',
  })

  const [attendees, setAttendees] = useState([])
  const [attendeeInput, setAttendeeInput] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

  if (!isOpen) return null

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      platform: 'google_meet',
    })
    setAttendees([])
    setAttendeeInput('')
    setShowToast(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddAttendee = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const email = attendeeInput.trim().replace(/,$/, '')
      if (email && !attendees.includes(email) && isValidEmail(email)) {
        setAttendees((prev) => [...prev, email])
        setAttendeeInput('')
      }
    }
  }

  const handleBlurAttendee = () => {
    const email = attendeeInput.trim().replace(/,$/, '')
    if (email && !attendees.includes(email) && isValidEmail(email)) {
      setAttendees((prev) => [...prev, email])
      setAttendeeInput('')
    }
  }

  const handleRemoveAttendee = (emailToRemove) => {
    setAttendees((prev) => prev.filter((email) => email !== emailToRemove))
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault()

  //   if (attendees.length === 0) {
  //     alert('Please add at least one attendee')
  //     return
  //   }

  //   // Combine date and time into ISO datetime strings
  //   const start_datetime = `${formData.startDate}T${formData.startTime}:00Z`
  //   const end_datetime = `${formData.endDate}T${formData.endTime}:00Z`

  //   const payload = {
  //     title: formData.title,
  //     description: formData.description,
  //     start_datetime,
  //     end_datetime,
  //     location_type: formData.platform,
  //     agenda: formData.description,
  //     invited_emails: attendees,
  //   }

  //   try {
  //     await MeetingPost(payload)
  //     setShowToast(true)
  //     onMeetingCreated?.()

  //     setTimeout(() => {
  //       setShowToast(false)
  //       onClose?.()
  //       resetForm()
  //     }, 2000)
  //   } catch (err) {
  //     console.error('Failed to create meeting:', err)
  //   }
  // }

  return (
    <>
      {/* MODAL BACKDROP OVERLAY */}
      <div
        className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto transition-opacity animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.()
        }}
      >
        {/* DIALOG CONTAINER */}
        <div
          aria-labelledby="modal-title"
          aria-modal="true"
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col my-auto transition-all"
          role="dialog"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight" id="modal-title">
                  Create New Meeting
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Set details and invite participants. A conference room link will be generated automatically.
              </p>
            </div>
            <button
              aria-label="Close dialog"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body Form */}
          <form className="flex flex-col gap-6 px-6 py-6 max-h-[72vh] overflow-y-auto"
            onSubmit={handleSubmit}>
            {/* Display API Error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* SECTION 1: Basic Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                <PencilLine className="h-4 w-4" />
                <span>1. Meeting Information</span>
              </div>

              {/* Meeting Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center justify-between" htmlFor="meeting-title">
                  <span>Meeting Title <span className="text-red-500">*</span></span>
                  <span className="text-xs text-slate-400 font-normal">Max 120 chars</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full h-11 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                    id="meeting-title"
                    name="title"
                    placeholder="e.g., Q4 Product Roadmap & Sprint Alignment"
                    required
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="meeting-desc">
                  Description <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none transition"
                  id="meeting-desc"
                  name="description"
                  placeholder="Add agenda overview, objectives, or context notes..."
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* SECTION 2: Date & Time */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                  <Clock3 className="h-4 w-4" />
                  <span>2. Date & Time Window</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Datetime */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="start-datetime">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      name="startDate"
                      className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="time"
                      name="startTime"
                      className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* End Datetime */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700" htmlFor="end-datetime">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      name="endDate"
                      className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="time"
                      name="endTime"
                      className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Platform Selection */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                  <Video className="h-4 w-4" />
                  <span>3. Conferencing Platform <span className="text-red-500">*</span></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                {/* Google Meet Radio Card */}
                <label
                  className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition border-2 ${formData.platform === 'google_meet'
                    ? 'bg-blue-50/50 border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="google_meet"
                    checked={formData.platform === 'google_meet'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-xs border border-slate-200">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Google Meet</h4>
                        <span className="text-xs text-blue-600 font-medium">Auto conference link</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.platform === 'google_meet' ? 'border-blue-600 bg-white' : 'border-slate-300'
                      }`}>
                      {formData.platform === 'google_meet' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                    </div>
                  </div>
                </label>

                {/* Zoom Radio Card */}
                <label
                  className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition border-2 ${formData.platform === 'zoom'
                    ? 'bg-blue-50/50 border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="zoom"
                    checked={formData.platform === 'zoom'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-xs border border-slate-200">
                        <Video className="h-5 w-5 text-slate-700" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Zoom</h4>
                        <span className="text-xs text-slate-500">Cloud Meeting</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.platform === 'zoom' ? 'border-blue-600 bg-white' : 'border-slate-300'
                      }`}>
                      {formData.platform === 'zoom' && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* SECTION 4: Invitations */}
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    Invite Participants <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">Min. 1 attendee</span>
                </div>
                <p className="text-xs text-slate-500">Type attendee email address and press Enter or comma to add.</p>
              </div>

              {/* Chip Container Input Box */}
              <div className="min-h-16 p-2 bg-white border border-slate-300 rounded-xl focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 flex flex-wrap items-center gap-1.5 transition">
                {attendees.map((email) => (
                  <span key={email} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-lg border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(email)}
                      className="hover:bg-slate-200 rounded-full p-0.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}

                {/* Inline active typing input */}
                <input
                  className="flex-1 min-w-40 h-7 bg-transparent px-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  id="attendee-input"
                  placeholder="Add attendee email..."
                  type="email"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyDown={handleAddAttendee}
                  onBlur={handleBlurAttendee}
                />
              </div>

              {/* Validation helper */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
                  <CircleCheck className="h-4 w-4" />
                  <span>{attendees.length} participants added • No duplicates</span>
                </div>
                <p className="text-xs text-slate-500">
                  Organizer ({user?.email || 'user@company.com'}) is automatically included as host.
                </p>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Esc</span>
                <span>to cancel</span>
              </div>
              <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                <button
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition cursor-pointer"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <span>Create Meeting</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* TOAST SUCCESS PREVIEW */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-60 max-w-md bg-slate-900 text-white rounded-xl shadow-xl p-4 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Meeting Created!</span>
            <span className="text-xs text-slate-300">Calendar invitations sent. Meeting link will appear shortly.</span>
          </div>
        </div>
      )}
    </>
  )
}

export default CreateMeeting