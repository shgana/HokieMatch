import { db, tables } from "../db/index.ts"
import type { UserPick } from "../types/index.ts"

export async function getPicks(userId: string): Promise<UserPick[]> {
  const { data, error } = await db
    .from(tables.picks)
    .select("*")
    .eq("user_id", userId)
    .order("position", { ascending: true })
  if (error) throw error
  return data as UserPick[]
}

export async function addPick(userId: string, courseId: string, note?: string): Promise<UserPick> {
  const { data, error } = await db
    .from(tables.picks)
    .upsert({ user_id: userId, course_id: courseId, note })
    .select("*")
    .single()
  if (error) throw error
  return data as UserPick
}

export async function removePick(userId: string, courseId: string): Promise<void> {
  const { error } = await db.from(tables.picks).delete().eq("user_id", userId).eq("course_id", courseId)
  if (error) throw error
}
