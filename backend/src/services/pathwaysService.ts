import { db, tables } from "../db/index.ts"
import type { PathwayArea, PathwayCourse, Course } from "../types/index.ts"

export async function getPathways(): Promise<PathwayArea[]> {
  const { data, error } = await db.from(tables.pathwaysAreas).select("*")
  if (error) throw error
  return data as PathwayArea[]
}

export async function getPathwayById(id: string): Promise<PathwayArea | null> {
  const { data, error } = await db.from(tables.pathwaysAreas).select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as PathwayArea | null
}

export async function getPathwayCourses(id: string): Promise<Array<PathwayCourse & { course: Course }>> {
  const { data, error } = await db
    .from(tables.pathwaysCourses)
    .select("*, course:courses(*)")
    .eq("pathway_id", id)
  if (error) throw error
  return data as Array<PathwayCourse & { course: Course }>
}
