import { db } from '../db'
import { goalCompletions } from '../db/schema'

interface completionsGoalRequest {
    goalId: string
}

export async function creategoals({ goalId }: completionsGoalRequest) {
  const result = await db
    .insert(goalCompletions)
    .values({
     goalId
    })
    .returning()

  //colocando o returning no final o array, ele me traz os
  //valores que foram inseridos no array

  const goalcompletions = result[0]

  return {
    goalcompletions,
  }
}
