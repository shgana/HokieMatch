import { z } from "zod"

export const darsUploadSchema = z.object({
  userId: z.string().uuid(),
  filename: z.string().optional(),
  raw: z.union([z.string(), z.record(z.any())]),
})

export const darsParsedSchema = z.object({
  completedCourses: z.array(
    z.object({
      code: z.string(),
      term: z.string().optional(),
      grade: z.string().optional(),
      credits: z.number().optional(),
    })
  ),
  inProgressCourses: z
    .array(
      z.object({
        code: z.string(),
        term: z.string().optional(),
      })
    )
    .optional(),
  requirementGroups: z.array(
    z.object({
      name: z.string(),
      status: z.enum(["Completed", "Remaining", "InProgress"]),
      details: z.any().optional(),
      remainingCourses: z.array(z.string()).optional(),
    })
  ),
  hoursCompleted: z.number(),
  hoursRemaining: z.number(),
  progressPercent: z.number(),
})

export const addPickSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string(),
  note: z.string().optional(),
})

export const removePickSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string(),
})

export const compareSchema = z.object({
  courseIds: z.array(z.string()).min(2).max(3),
})

export const recommendationRequestSchema = z.object({
  userId: z.string().uuid().optional(),
  limit: z.number().min(1).max(50).optional(),
})
