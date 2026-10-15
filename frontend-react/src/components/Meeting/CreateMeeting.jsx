import { useCallback, useEffect, useState } from 'react'
import { Check, CircleCheck, Clock3, LoaderCircle, PencilLine, Video, X } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { useAuth } from '../../context/AuthContextProvider'
import { useMeeting } from '../../context/MeetingContextProvider'
import { meetingSchema } from '../../schemas/meetingSchema'   // -> Validation

const defaults = {
  title: '',
  description: '',
  agenda: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  location_type: 'google_meet',
  invited_emails: [],
}

// for input box error message
const FieldError = ({ message }) =>
  message && <p className="mt-1.5 text-xs text-red-600">{message}</p>

// for input box border coloring
const inputClass = (error) =>
  `w-full rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-600/20 
  ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}
  `

const CreateMeeting = ({ isOpen, onClose, onMeetingCreated }) => {
  const { user } = useAuth()
  const { MeetingPost } = useMeeting()
  const [attendeeInput, setAttendeeInput] = useState('')
  const [showToast, setShowToast] = useState(false)

  const { register, handleSubmit, control, setError, setValue, clearErrors, reset,
    formState: { errors, isSubmitting }, } = useForm({
      resolver: zodResolver(meetingSchema),
      defaultValues: defaults,
    })

  const attendees = useWatch({ control, name: 'invited_emails' })
  const platform = useWatch({ control, name: 'location_type' })

  const closeModal = useCallback(() => {
    reset(defaults)
    setAttendeeInput('')
    setShowToast(false)
    onClose?.()
  }, [onClose, reset])

  useEffect(() => {
    if (!isOpen) return undefined
    const escape = (event) => event.key === 'Escape' && closeModal()
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [closeModal, isOpen])

  const addAttendee = () => {
    const email = attendeeInput.trim().replace(/,$/, '').toLowerCase()
    if (!email) return

    if (!meetingSchema.shape.invited_emails.element.safeParse(email).success) {
      setError('invited_emails', {
        type: 'manual',
        message: 'Enter a valid email address.',
      })
      return
    }
    if (attendees.includes(email)) {
      setError('invited_emails', {
        type: 'manual',
        message: 'This participant has already been added.',
      })
      return
    }

    setValue('invited_emails', [...attendees, email], { shouldValidate: true })
    // ...attendees: Copies all existing emails.
    // email: Adds the new one.

    clearErrors('invited_emails')
    setAttendeeInput('')
  }

  const applyApiErrors = (data) => {
    const fields = {
      start_datetime: 'startTime',
      end_datetime: 'endTime',
      non_field_errors: 'endTime',
      detail: 'title',
      location_type: 'location_type',
      invited_emails: 'invited_emails',
    }
    if (!data || typeof data !== 'object') {
      setError('title', {
        type: 'server',
        message: 'Unable to create the meeting. Please try again.',
      })
      return
    }
    Object.entries(data).forEach(([key, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : messages
      setError(fields[key] || key, { type: 'server', message: String(message) })
    })
  }

  const submit = async (data) => {
    try {
      await MeetingPost({
        title: data.title,
        description: data.description || '',
        agenda: data.agenda || '',
        start_datetime: new Date(`${data.startDate}T${data.startTime}`).toISOString(),
        end_datetime: new Date(`${data.endDate}T${data.endTime}`).toISOString(),
        location_type: data.location_type,
        invited_emails: data.invited_emails,
      })
      onMeetingCreated?.()
      setShowToast(true)
      window.setTimeout(closeModal, 1500)
    } catch (error) {
      applyApiErrors(error.response?.data)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111827]/40 p-4 backdrop-blur-[2px] sm:p-6"
        onClick={(event) =>
          event.target === event.currentTarget && closeModal()
        }
      >
        <div
          aria-labelledby="modal-title"
          aria-modal="true"
          className="my-auto flex w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
          role="dialog"
        >
          <header className="flex items-start justify-between border-b border-slate-100 px-6 pb-4 pt-6">
            <div>
              <h2
                className="text-xl font-bold tracking-tight text-slate-900"
                id="modal-title"
              >
                Create New Meeting
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Set details and invite participants.
              </p>
            </div>
            <button
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={closeModal}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <form
            className="flex max-h-[72vh] flex-col gap-6 overflow-y-auto px-6 py-6"
            noValidate
            onSubmit={handleSubmit(submit)}
          >
            <section className="flex flex-col gap-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <PencilLine className="h-4 w-4" />
                Meeting Information
              </p>
              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="meeting-title"
                >
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="meeting-title"
                  className={`${inputClass(errors.title)} mt-1.5 h-11 px-3.5`}
                  placeholder="e.g., Product roadmap review"
                  {...register('title')}
                  required
                />
                <FieldError message={errors.title?.message} />
              </div>
              <TextArea
                id="meeting-description"
                label="Description"
                optional
                error={errors.description}
                placeholder="Add context for participants..."
                register={register('description')}
              />
              <TextArea
                id="meeting-agenda"
                label="Agenda"
                optional
                error={errors.agenda}
                placeholder="Topics to discuss..."
                register={register('agenda')}
              />
            </section>

            <section className="flex flex-col gap-4 border-t border-slate-100 pt-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Clock3 className="h-4 w-4" />
                Date &amp; Time
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DateTimeFields
                  label="Start"
                  dateError={errors.startDate}
                  timeError={errors.startTime}
                  dateRegister={register('startDate')}
                  timeRegister={register('startTime')}
                />
                <DateTimeFields
                  label="End"
                  dateError={errors.endDate}
                  timeError={errors.endTime}
                  dateRegister={register('endDate')}
                  timeRegister={register('endTime')}
                />
              </div>
            </section>

            <section className="flex flex-col gap-4 border-t border-slate-100 pt-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Video className="h-4 w-4" />
                Conferencing Platform
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {['google_meet', 'zoom'].map((type) => (
                  <PlatformOption
                    key={type}
                    type={type}
                    platform={platform}
                    register={register}
                  />
                ))}
              </div>
              <FieldError message={errors.location_type?.message} />
            </section>

            <section className="flex flex-col gap-3 border-t border-slate-100 pt-5">
              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="attendee-input"
                >
                  Invite Participants <span className="text-red-500">*</span>
                </label>
                <p className="mt-0.5 text-xs text-slate-500">
                  Type an email and press Enter or comma.
                </p>
              </div>
              <div
                className={`flex min-h-16 flex-wrap items-center gap-1.5 rounded-xl border p-2 ${errors.invited_emails
                  ? 'border-red-400'
                  : 'border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20'
                  }`}
              >
                {attendees.map((email) => (
                  <AttendeeChip
                    key={email}
                    email={email}
                    onRemove={() =>
                      setValue(
                        'invited_emails',
                        attendees.filter((item) => item !== email),
                        { shouldValidate: true }
                      )
                    }
                  />
                ))}
                <input
                  id="attendee-input"
                  className="h-7 min-w-40 flex-1 bg-transparent px-1 text-xs text-slate-800 outline-none"
                  placeholder="Add participant email..."
                  type="email"
                  value={attendeeInput}
                  onChange={(event) => setAttendeeInput(event.target.value)}
                  onBlur={addAttendee}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault()
                      addAttendee()
                    }
                  }}
                  required
                />
              </div>
              <FieldError message={errors.invited_emails?.message} />
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <CircleCheck className="h-4 w-4 text-emerald-600" />
                Organizer ({user?.email || 'you'}) is included automatically.
              </p>
            </section>

            <footer className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={closeModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Scheduling...' : 'Create Meeting'}
              </button>
            </footer>
          </form>
        </div>
      </div>
      {showToast && (
        <div className="fixed bottom-6 right-6 z-60 flex items-center gap-3 rounded-xl bg-slate-900 p-4 text-white shadow-xl">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <Check className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">
            Meeting created successfully.
          </span>
        </div>
      )}
    </>
  )
}

const TextArea = ({ id, label, optional, error, placeholder, register }) => (
  <div>
    <label className="text-sm font-medium text-slate-700" htmlFor={id}>
      {label}{' '}
      {optional && (
        <span className="text-xs font-normal text-slate-400">(Optional)</span>
      )}
    </label>
    <textarea
      id={id}
      className={`${inputClass(error)} mt-1.5 resize-none p-3.5`}
      rows="3"
      placeholder={placeholder}
      {...register}
    />
    <FieldError message={error?.message} />
  </div>
)

const DateTimeFields = ({ label, dateError, timeError, dateRegister, timeRegister }) => (
  <div>
    <label className="text-sm font-medium text-slate-700">
      {label} <span className="text-red-500">*</span>
    </label>
    <div className="mt-1.5 grid grid-cols-2 gap-2">
      <input
        type="date"
        className={`${inputClass(dateError)} h-10 px-3 text-xs`}
        {...dateRegister}
        required
      />
      <input
        type="time"
        className={`${inputClass(timeError)} h-10 px-3 text-xs`}
        {...timeRegister}
        required
      />
    </div>
    <FieldError message={dateError?.message || timeError?.message} />
  </div>
)

const PlatformOption = ({ type, platform, register }) => (
  <label
    className={`cursor-pointer rounded-xl border-2 p-4 transition ${platform === type
      ? 'border-blue-600 bg-blue-50/50'
      : 'border-slate-200 hover:border-slate-300'
      }`}
  >
    <input
      type="radio"
      value={type}
      className="sr-only"
      {...register('location_type')}
    />
    <span className="flex items-center gap-3">
      <Video className="h-5 w-5 text-blue-600" />
      <span>
        <b className="block text-sm text-slate-900">
          {type === 'google_meet' ? 'Google Meet' : 'Zoom'}
        </b>
        <span className="text-xs text-slate-500">Auto conference link</span>
      </span>
    </span>
  </label>
)

const AttendeeChip = ({ email, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-slate-800">
    <span>{email}</span>
    <button
      type="button"
      aria-label={`Remove ${email}`}
      onClick={onRemove}
      className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-600"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </span>
)

export default CreateMeeting