#!/usr/bin/env ts-node
import * as fs from "fs"
import * as readline from "readline"
import * as path from "path"
import * as dotenv from "dotenv"

import { supabaseAdmin } from "../src/lib/supabase.ts"
import { tables } from "../src/db/index.ts"

dotenv.config({ path: path.resolve(process.cwd(), ".env") })

type CsvRow = {
  course_id: string
  instructor: string
  term?: string
  section?: string
  a_count: number
  b_count: number
  c_count: number
  d_count: number
  f_count: number
  w_count?: number
  avg_gpa: number
}

function normalizeInstructor(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase()
}

async function upsertInstructor(name: string) {
  if (!name) return null
  const normalized = normalizeInstructor(name)
  const { data, error } = await supabaseAdmin
    .from(tables.instructors)
    .upsert({ name, normalized_name: normalized })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

async function insertGrades(rows: any[]) {
  const chunkSize = 500
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabaseAdmin.from(tables.grades).insert(
      chunk.map((r) => ({
        course_id: r.course_id,
        instructor_id: r.instructor_id,
        term: r.term,
        section: r.section,
        a_count: r.a_count,
        b_count: r.b_count,
        c_count: r.c_count,
        d_count: r.d_count,
        f_count: r.f_count,
        w_count: r.w_count ?? 0,
        avg_gpa: r.avg_gpa,
      }))
    )
    if (error) throw error
    console.log(`Inserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`)
  }
}

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error("Usage: ts-node scripts/ingest-grade-distributions.ts <path/to/file.csv>")
    process.exit(1)
  }
  const stream = fs.createReadStream(file)
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })

  const rows: any[] = []
  let header: string[] = []
  let lineNo = 0
  for await (const line of rl) {
    lineNo++
    if (lineNo === 1) {
      header = line.split(",").map((h) => h.trim())
      continue
    }
    const cols = line.split(",")
    if (cols.length < header.length) continue
    const record: Record<string, string> = {}
    header.forEach((h, idx) => (record[h] = cols[idx]))
    const instructorId = await upsertInstructor(record["instructor"])
    rows.push({
      ...record,
      instructor_id: instructorId,
      a_count: Number(record["a_count"] ?? 0),
      b_count: Number(record["b_count"] ?? 0),
      c_count: Number(record["c_count"] ?? 0),
      d_count: Number(record["d_count"] ?? 0),
      f_count: Number(record["f_count"] ?? 0),
      w_count: Number(record["w_count"] ?? 0),
      avg_gpa: Number(record["avg_gpa"] ?? 0),
    })
  }

  await insertGrades(rows)
  console.log("ETL complete")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
