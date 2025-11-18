import type { GradeDistribution, RecommendationResult } from "../types/index.ts"

type ScoreOpts = {
  base: number
  gpa: number
  instructorGpa?: number | null
  passRate: number
  pathwayHits: string[]
  difficulty: "Easy" | "Medium" | "Hard"
}

export function scoreCourse(opts: ScoreOpts): RecommendationResult {
  const { base, gpa, instructorGpa, passRate, pathwayHits, difficulty } = opts
  const difficultyWeight = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 0.7 : 0.45
  const instructorWeight = instructorGpa ? (instructorGpa - 2.5) * 0.5 : 0
  const passWeight = passRate * 0.3
  const pathwayWeight = Math.min(pathwayHits.length, 3) * 0.2

  const score = base + gpa * 0.8 * difficultyWeight + instructorWeight + passWeight + pathwayWeight

  const rationale = [
    `Avg GPA ${gpa.toFixed(2)}`,
    `Pass rate ${(passRate * 100).toFixed(0)}%`,
    `Difficulty weight ${difficulty}`,
  ]
  if (instructorGpa) rationale.push(`Instructor GPA ${instructorGpa.toFixed(2)}`)
  if (pathwayHits.length) rationale.push(`Pathways: ${pathwayHits.join(", ")}`)

  return {
    course_id: "",
    score,
    rationale,
    avg_gpa: gpa,
    instructor_gpa: instructorGpa ?? null,
    pathway_hits: pathwayHits,
    difficulty,
  }
}

export function computePassRate(grades: GradeDistribution[]): number {
  const totals = grades.reduce(
    (acc, g) => {
      acc.total += g.total
      acc.fail += g.f_count + g.d_count + (g.w_count ?? 0)
      return acc
    },
    { total: 0, fail: 0 }
  )
  if (!totals.total) return 0
  return (totals.total - totals.fail) / totals.total
}

export function average(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}
