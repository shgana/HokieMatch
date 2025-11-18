export type UUID = string

export type Course = {
  id: string
  code?: string
  title: string
  description?: string
  credits: number
  pathways: string[]
  tags: string[]
  gpa?: number
  difficulty?: "Easy" | "Medium" | "Hard"
  instructors?: string[]
  prerequisites?: string[]
}

export type GradeDistribution = {
  id: UUID
  course_id: string
  instructor_id?: UUID | null
  term?: string | null
  section?: string | null
  a_count: number
  b_count: number
  c_count: number
  d_count: number
  f_count: number
  w_count?: number | null
  total: number
  avg_gpa: number
}

export type PathwayArea = {
  id: string
  name: string
  category: string
  credits_required: number
  description?: string
  level?: string
  courses?: string[]
}

export type PathwayCourse = {
  id: UUID
  pathway_id: string
  course_id: string
  course?: Course
}

export type DarsParsed = {
  completedCourses: Array<{ code: string; term?: string; grade?: string; credits?: number }>
  inProgressCourses?: Array<{ code: string; term?: string }>
  requirementGroups: Array<{
    name: string
    status: "Completed" | "Remaining" | "InProgress"
    details?: unknown
    remainingCourses?: string[]
  }>
  hoursCompleted: number
  hoursRemaining: number
  progressPercent: number
}

export type DarsReport = {
  id: UUID
  user_id: UUID
  filename?: string
  raw: unknown
  parsed?: DarsParsed
  hours_completed: number
  hours_remaining: number
  progress_percent?: number
  created_at: string
}

export type RequirementGroup = {
  id: UUID
  dars_id?: UUID
  user_id: UUID
  group_name: string
  status: "Completed" | "Remaining" | "InProgress"
  details?: any
}

export type RemainingRequirement = {
  id: UUID
  user_id: UUID
  dars_id?: UUID
  requirement_id?: UUID
  course_options: string[]
  credits_needed?: number
  notes?: string
}

export type UserPick = {
  id: UUID
  user_id: UUID
  course_id: string
  note?: string
  position: number
}

export type RecommendationResult = {
  course_id: string
  score: number
  rationale: string[]
  avg_gpa: number
  instructor_gpa?: number | null
  pathway_hits: string[]
  difficulty: "Easy" | "Medium" | "Hard"
}

export type CourseComparisonPayload = {
  courses: Array<{
    id: string
    title: string
    avg_gpa: number
    difficulty: "Easy" | "Medium" | "Hard"
    pathways: string[]
    instructor_gpa?: number | null
    grade_distribution?: GradeDistribution[]
  }>
}
