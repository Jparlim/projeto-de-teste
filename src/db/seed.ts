import { client, db } from './index'
import { goals, goalCompletions } from './schema'
import dayjs from 'dayjs'

async function seed() {
  await db.delete(goalCompletions)
  //tenho que coloca o goalscompletions pq ele está conectado com a tabela goals,
  // caso eu apague a tabela goals primeiro, vai dar erro de chave strangeira
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'me exercitar', desiredWeeklyFrequency: 5 },
      { title: 'meditar', desiredWeeklyFrequency: 5 },
    ])
    .returning()

  const startofweek = dayjs().startOf('week')

  await db.insert(goalCompletions).values([
    { goalId: result[0].id, createdAt: startofweek.toDate() },
    { goalId: result[1].id, createdAt: startofweek.add(1, 'day').toDate() },
  ])
  //pra mim pega o id da tabela de goals preciso colocar no final de "values"
  //e colocar o returning, após isso, coloque o sistema em uma
  //constante!
}

seed().finally(() => {
  client.end()
})
