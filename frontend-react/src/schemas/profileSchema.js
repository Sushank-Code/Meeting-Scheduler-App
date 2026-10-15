import { z } from 'zod'

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username cannot exceed 50 characters.'),
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(50, 'First name cannot exceed 50 characters.'),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(50, 'Last name cannot exceed 50 characters.'),
  profile_picture: z
    .string()
    .trim()
    .max(500, 'Image URL is too long.')
    .refine((v) => v === '' || z.url().safeParse(v).success, 'Enter a valid image URL.')
    .optional(),
})
