import fastify from 'fastify'
import { creategoals } from '../functions/create-goals'
import z from 'zod'

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { getWeekPendingGoals } from '../functions/get-week-pending-goals'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(6),
      }),
    },
  },
  async request => {
    const creategoalschema = z.object({
      title: z.string(),
      desiredWeeklyFrequency: z.number().int().min(1).max(6),
    })
    const body = creategoalschema.parse(request.body)

    const { title, desiredWeeklyFrequency } = request.body

    await creategoals({
      title,
      desiredWeeklyFrequency,
    })
  }
)

app.get('/pendings', async () => {
  const { pendinggoals } = await getWeekPendingGoals()

  return pendinggoals
})

/*
app.post('/goals', async request => {
    const schema = z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7)
    })

    const body = schema.parse(request.body)

    await creategoals({
        title: body.title,
        desiredWeeklyFrequency: body.desiredWeeklyFrequency
    })
})
*/

app.listen({ port: 3000 }, () => console.log('SERVER IS RUNNING'))
