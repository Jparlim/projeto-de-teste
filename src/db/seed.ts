import { client, db } from './index'
import { goals, goalCompletions } from './schema'

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

  await db.insert(goalCompletions).values([{ goalId: result[0].id }])
  //pra mim pega o id da tabela de goals preciso colocar no final de "values" e colocar o returning, após isso, coloque o sistema em uma constante!
}

seed().finally(() => {
  client.end()
})
