import { SupabaseClient } from "@supabase/supabase-js"

import { supabaseAdmin } from "@/lib/supabase"
import type {
  CompletedCourse,
  Course,
  DarsReport,
  GradeDistribution,
  PathwayArea,
  PathwayCourse,
  RemainingRequirement,
  Requirement,
  UserPick,
} from "@/lib/types"

// Helper typed methods for common queries to keep service files lean.

export const db: SupabaseClient = supabaseAdmin

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

export type DbCourse = Course
export type DbGradeDistribution = GradeDistribution
export type DbPathwayArea = PathwayArea
export type DbPathwayCourse = PathwayCourse
export type DbDarsReport = DarsReport
export type DbRequirement = Requirement
export type DbCompletedCourse = CompletedCourse
export type DbRemainingRequirement = RemainingRequirement
export type DbUserPick = UserPick

