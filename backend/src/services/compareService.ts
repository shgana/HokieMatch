import { getCourseById, getGradeDistributions } from "./courseService.ts"
import type { CourseComparisonPayload } from "../types/index.ts"

export async function compareCourses(ids: string[]): Promise<CourseComparisonPayload> {
  const courses = []
  for (const id of ids) {
    const course = await getCourseById(id)
    if (!course) continue
    const grades = await getGradeDistributions(id)
    const avgGpa =
      grades.length > 0 ? grades.reduce((acc, g) => acc + (Number(g.avg_gpa) || 0), 0) / grades.length : 0
    const difficulty = avgGpa >= 3.5 ? "Easy" : avgGpa >= 3.0 ? "Medium" : "Hard"
    courses.push({
      id: course.id,
      title: course.title,
      avg_gpa: avgGpa,
      difficulty,
      pathways: course.pathways ?? [],
      instructor_gpa: grades.find((g) => g.instructor_id)?.avg_gpa ?? null,
      grade_distribution: grades,
    })
  }
  return { courses }
}
