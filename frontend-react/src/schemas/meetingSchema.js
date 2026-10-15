import { z } from 'zod'

const meetingBase = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(200, 'Title cannot exceed 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters.')
    .optional(),
  agenda: z
    .string()
    .trim()
    .max(2000, 'Agenda cannot exceed 2000 characters.')
    .optional(),
  startDate: z.string().min(1, 'Choose a start date.'),
  startTime: z.string().min(1, 'Choose a start time.'),
  endDate: z.string().min(1, 'Choose an end date.'),
  endTime: z.string().min(1, 'Choose an end time.'),
})

const ensureChronology = (data, context) => {     // lets you write custom logic
  if (!data.startDate || !data.startTime || !data.endDate || !data.endTime)
    return

  const startDateTime = new Date(`${data.startDate}T${data.startTime}`)
  const endDateTime = new Date(`${data.endDate}T${data.endTime}`)

  if (endDateTime <= startDateTime) {
    context.addIssue({
      code: 'custom',
      path: ['endTime'],
      message: 'End time must be after the start time.',
    })
  }
}

export const meetingSchema = meetingBase
  .extend({
    location_type: z.enum(['google_meet', 'zoom']),   // force to pick one
    invited_emails: z
      .array(z.email('Enter a valid email address.'))
      .min(1, 'Add at least one participant.'),
  })
  .superRefine(ensureChronology)

export const meetingUpdateSchema = meetingBase.superRefine(ensureChronology)