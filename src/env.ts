import z from 'zod'

export const database = z.object({
  DATABASE_URL: z.string().url(),
})

export const env = database.parse(process.env)
