import { supabaseAdmin } from "../lib/supabase.ts"
import type {
  Course,
  GradeDistribution,
  PathwayArea,
  PathwayCourse,
  DarsReport,
  Requirement,
  CompletedCourse,
  RemainingRequirement,
  UserPick,
} from "../types/index.ts"

export const tables = {
  courses: "courses",
  sections: "course_sections",
  instructors: "instructors",
  grades: "grade_distributions",
  pathwaysAreas: "pathways_areas",
  pathwaysCourses: "pathways_courses",
  dars: "dars_reports",
  requirements: "requirements",
  completed: "completed_courses",
  remaining: "remaining_requirements",
  picks: "user_picks",
  recsCache: "recommendations_cache",
} as const

export const db = supabaseAdmin

export type DbCourse = Course
export type DbGradeDistribution = GradeDistribution
export type DbPathwayArea = PathwayArea
export type DbPathwayCourse = PathwayCourse
export type DbDarsReport = DarsReport
export type DbRequirement = Requirement
export type DbCompletedCourse = CompletedCourse
export type DbRemainingRequirement = RemainingRequirement
export type DbUserPick = UserPick
