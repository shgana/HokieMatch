import { db, tables } from "../db/index.ts"
import type { Course, GradeDistribution } from "../types/index.ts"

export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await db.from(tables.courses).select("*")
  if (error) throw error
  return data as Course[]
}

export async function getCourseById(id: string): Promise<Course | null> {
  const { data, error } = await db.from(tables.courses).select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data as Course | null
}

export async function searchCourses(query: string): Promise<Course[]> {
  const { data, error } = await db
    .from(tables.courses)
    .select("*")
    .or(`id.ilike.%${query}%,title.ilike.%${query}%`)
    .limit(25)
  if (error) throw error
  return data as Course[]
}

export async function getGradeDistributions(courseId: string): Promise<GradeDistribution[]> {
  const { data, error } = await db
    .from(tables.grades)
    .select("*")
    .eq("course_id", courseId)
    .order("term", { ascending: false })
    .limit(100)
  if (error) throw error
  return data as GradeDistribution[]
}

export async function getSections(courseId: string) {
  const { data, error } = await db.from(tables.sections).select("*").eq("course_id", courseId)
  if (error) throw error
  return data
}
