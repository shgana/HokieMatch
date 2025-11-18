import { db, tables } from "@/db"
import type { Course, GradeDistribution } from "@/lib/types"

export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await db.from(tables.courses).select("*")
  if (error) throw error
  return data as Course[]
}

export async function getCourseById(id: string): Promise<Course | null> {
  const { data, error } = await db.from(tables.courses).select("*").eq("id", id).single()
  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as Course
}

export async function searchCourses(query: string): Promise<Course[]> {
  const { data, error } = await db
    .from(tables.courses)
    .select("*")
    .ilike("id", `%${query}%`)
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
    .limit(50)
  if (error) throw error
  return data as GradeDistribution[]
}

