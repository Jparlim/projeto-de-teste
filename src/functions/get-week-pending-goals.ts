import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { number } from 'zod'

dayjs.extend(weekOfYear)

export function getWeekPendingGoals() {
  const lastdayofweek = dayjs().endOf('week').toDate()
  const firstdayofweek = dayjs().startOf('week').toDate()

  //ESTE WITH COM $ ESTE SINAL NA FRENTE, SIGNIFICA QUE ELE ESTA CRIANDO UMA SUBTABELA QUE NÃO ENTENDI OQ FAZ
  const goalsCreatedUpToWeek = db.$with('goals-created-up-to-week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastdayofweek))
  )

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

  const pendinggoals = db
    .with(goalsCreatedUpToWeek, GoalsCompletionsCounts)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      goalscompletiosncount: sql`
        COALESCE(${GoalsCompletionsCounts.goalscompletiosncount}, 0)`.mapWith(
        Number
      ),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      GoalsCompletionsCounts,
      eq(goalsCreatedUpToWeek.id, GoalsCompletionsCounts.goalId)
    )

  return {
    pendinggoals,
  }
}
