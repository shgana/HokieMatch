import { darsParsedSchema } from "./validation.ts"
import type { DarsParsed } from "../types/index.ts"

export function parseDarsPayload(input: unknown): DarsParsed {
  const result = darsParsedSchema.safeParse(input)
  if (result.success) return result.data

  if (typeof input === "string") {
    const courseMatches = Array.from(input.matchAll(/[A-Z]{2,4}\s?\d{4}/g)).map((m) => m[0].replace(/\s+/, " "))
    const unique = Array.from(new Set(courseMatches))
    const parsed: DarsParsed = {
      completedCourses: unique.map((code) => ({ code })),
      requirementGroups: [],
      hoursCompleted: 0,
      hoursRemaining: 0,
      progressPercent: 0,
    }
    return parsed
  }

  throw new Error("Unable to parse DARS payload; provide valid JSON or text.")
}
