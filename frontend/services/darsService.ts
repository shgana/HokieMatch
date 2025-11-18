import { db, tables } from "@/db"
import type {
  CompletedCourse,
  DarsParsed,
  DarsReport,
  RemainingRequirement,
  Requirement,
} from "@/lib/types"
import { darsParsedSchema, darsUploadSchema } from "@/utils/validation"
import { parseDarsPayload } from "@/utils/darsParser"

export async function uploadDars(payload: unknown): Promise<DarsReport> {
  const parsedUpload = darsUploadSchema.parse(payload)
  const parsedDars = parseDarsPayload(parsedUpload.raw)
  const validated = darsParsedSchema.parse(parsedDars)

  const { data, error } = await db
    .from(tables.dars)
    .insert({
      user_id: parsedUpload.userId,
      filename: parsedUpload.filename ?? "dars.json",
      raw: parsedUpload.raw,
      parsed: validated,
      hours_completed: validated.hoursCompleted,
      hours_remaining: validated.hoursRemaining,
      progress_percent: validated.progressPercent,
    })
    .select("*")
    .single()

  if (error) throw error

  // Persist requirements + completed courses
  await persistDerivedData(parsedUpload.userId, data.id, validated)

  return data as DarsReport
}

async function persistDerivedData(userId: string, darsId: string, parsed: DarsParsed) {
  // Completed courses
  if (parsed.completedCourses.length) {
    const rows: Partial<CompletedCourse>[] = parsed.completedCourses.map((c) => ({
      user_id: userId,
      course_id: c.code,
      term: c.term,
      grade: c.grade,
      credits: c.credits,
    }))
    await db.from(tables.completed).upsert(rows, { onConflict: "user_id,course_id" })
  }

  // Requirement groups
  if (parsed.requirementGroups.length) {
    const reqRows: Partial<Requirement>[] = parsed.requirementGroups.map((r) => ({
      user_id: userId,
      dars_id: darsId,
      group_name: r.name,
      status: r.status,
      details: r.details,
    }))
    const { data: reqInserted, error: reqErr } = await db
      .from(tables.requirements)
      .insert(reqRows)
      .select("*")
    if (reqErr) throw reqErr

    const remainingRows: Partial<RemainingRequirement>[] = []
    parsed.requirementGroups.forEach((group, idx) => {
      const req = reqInserted?.[idx]
      if (group.status !== "Remaining" || !group.remainingCourses?.length) return
      remainingRows.push({
        user_id: userId,
        dars_id: darsId,
        requirement_id: req?.id,
        course_options: group.remainingCourses,
      })
    })
    if (remainingRows.length) {
      await db.from(tables.remaining).insert(remainingRows)
    }
  }
}

export async function getDarsSummary(userId: string): Promise<DarsReport | null> {
  const { data, error } = await db
    .from(tables.dars)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as DarsReport | null
}

export async function getRequirements(userId: string): Promise<Requirement[]> {
  const { data, error } = await db.from(tables.requirements).select("*").eq("user_id", userId)
  if (error) throw error
  return data as Requirement[]
}

export async function getRemaining(userId: string): Promise<RemainingRequirement[]> {
  const { data, error } = await db.from(tables.remaining).select("*").eq("user_id", userId)
  if (error) throw error
  return data as RemainingRequirement[]
}

