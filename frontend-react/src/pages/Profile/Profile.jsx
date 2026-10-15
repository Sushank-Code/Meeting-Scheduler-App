import { useEffect, useState } from 'react'
import { CircleCheck, LoaderCircle, Trash, TriangleAlert } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useAuth } from '../../context/AuthContextProvider'
import { profileSchema } from '../../schemas/profileSchema'

// for input box error message
const FieldError = ({ message }) =>
  message && <p className="mt-1.5 text-xs text-red-600">{message}</p>

// for input box border coloring
const inputClass = (error) =>
  `w-full rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-600/20
  ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-600'}
  `

const avatarInitials = (user) => {
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || user?.email || '?'
  return name.split(/[\s._@-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'
}

const Profile = () => {
  const { user, ProfileUpdate, AccountDelete } = useAuth()
  const [toast, setToast] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3200)
  }

  const { register, handleSubmit, control, setError, reset,
    formState: { errors, isSubmitting }, } = useForm({
      resolver: zodResolver(profileSchema),
      defaultValues: { username: '', first_name: '', last_name: '', profile_picture: '' },
    })

  // prefill once the user loads
  useEffect(() => {
    if (!user) return
    reset({
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      profile_picture: user.profile_picture || '',
    })
  }, [user, reset])

  const picturePreview = useWatch({ control, name: 'profile_picture' })

  const applyApiErrors = (data) => {
    const known = ['username', 'first_name', 'last_name', 'profile_picture']
    if (!data || typeof data !== 'object') {
      showToast('Unable to update profile. Please try again.', true)
      return
    }
    Object.entries(data).forEach(([key, messages]) => {
      const message = String(Array.isArray(messages) ? messages[0] : messages)
      if (known.includes(key)) {
        setError(key, { type: 'server', message })
      } else {
        showToast(message, true)
      }
    })
  }

  const submit = async (data) => {
    try {
      await ProfileUpdate({
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        profile_picture: data.profile_picture || '',
      })
      showToast('Profile updated successfully.')
    } catch (error) {
      applyApiErrors(error.response?.data)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete your account and all your meetings? This cannot be undone.')) return
    setIsDeleting(true)
    try {
      await AccountDelete()
      // AccountDelete logs out and redirects to '/'
    } catch (error) {
      const data = error.response?.data
      showToast(data?.detail || 'Failed to delete account. Please try again.', true)
      setIsDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-[#F9FAFB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your public details. Your email stays as-is.</p>
        </div>

        {/* Details card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            {(picturePreview || user.profile_picture) ? (
              <img
                src={picturePreview || user.profile_picture}
                alt={user.username}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-100"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {avatarInitials(user)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{user.username}</p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
              {user.provider && (
                <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-600">
                  {user.provider} account
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(submit)} noValidate className="mt-5 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="profile-username">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-username"
                className={`${inputClass(errors.username)} mt-1.5 h-11 px-3.5`}
                placeholder="your-username"
                {...register('username')}
                required
              />
              <FieldError message={errors.username?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-first">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-first"
                  className={`${inputClass(errors.first_name)} mt-1.5 h-11 px-3.5`}
                  placeholder="Jane"
                  {...register('first_name')}
                  required
                />
                <FieldError message={errors.first_name?.message} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="profile-last">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-last"
                  className={`${inputClass(errors.last_name)} mt-1.5 h-11 px-3.5`}
                  placeholder="Doe"
                  {...register('last_name')}
                  required
                />
                <FieldError message={errors.last_name?.message} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="profile-picture">
                Profile picture <span className="text-xs font-normal text-slate-400">(image URL, optional)</span>
              </label>
              <input
                id="profile-picture"
                className={`${inputClass(errors.profile_picture)} mt-1.5 h-11 px-3.5`}
                placeholder="https://..."
                {...register('profile_picture')}
              />
              <FieldError message={errors.profile_picture?.message} />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-red-700">Danger Zone</h2>
          <p className="mt-1 text-xs text-slate-500">
            Permanently deletes your account, meetings you organized, and all your data. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
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

export default Profile
