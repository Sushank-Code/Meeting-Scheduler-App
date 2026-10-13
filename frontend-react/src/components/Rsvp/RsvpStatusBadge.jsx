import { Check, Clock, X } from 'lucide-react'

const styles = {
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  declined: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
}

const labels = {
  accepted: 'Accepted',
  declined: 'Declined',
  pending: 'Invitation Pending',
}

const RsvpStatusBadge = ({ status = 'pending' }) => {
  const key = styles[status] ? status : 'pending'
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[key]}`}>
      {key === 'accepted' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      {key === 'declined' && <X className="h-3.5 w-3.5" strokeWidth={3} />}
      {key === 'pending' && <Clock className="h-3.5 w-3.5" />}
      {labels[key]}
    </span>
  )
}

export default RsvpStatusBadge
