import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

interface completionsGoalRequest {
  goalId: string
}

export async function creategoalscompletios({
  goalId,
}: completionsGoalRequest) {
  const lastdayofweek = dayjs().endOf('week').toDate()
  const firstdayofweek = dayjs().startOf('week').toDate()

  const GoalsCompletionsCounts = db.$with('goals-completios-count').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        goalscompletiosncount: count(goalCompletions.id).as(
          'goalscompletiosncount'
        ),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstdayofweek),
          lte(goalCompletions.createdAt, lastdayofweek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result2 = await db
    .with(GoalsCompletionsCounts)
    .select({
      title: goals.title,
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      goalscompletiosncount: sql`
      COALESCE(${GoalsCompletionsCounts.goalscompletiosncount}, 0)`.mapWith(
        Number
      ),
    })
    .from(goals)
    .leftJoin(
      GoalsCompletionsCounts,
      eq(GoalsCompletionsCounts.goalId, goals.id)
    )
    .where(eq(goals.id, goalId))

  //colocando o returning no final o array, ele me traz os
  //valores que foram inseridos no array

  return {
    result2,
  }
}
