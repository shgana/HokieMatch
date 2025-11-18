import { z } from "zod"

import { darsParsedSchema } from "@/utils/validation"
import type { DarsParsed } from "@/lib/types"

// Placeholder parser: accepts already-parsed JSON or minimal text.
export function parseDarsPayload(input: unknown): DarsParsed {
  // If already matches schema, pass through
  const result = darsParsedSchema.safeParse(input)
  if (result.success) return result.data

  if (typeof input === "string") {
    // Very naive text fallback: extract course codes like "CS 2114"
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

