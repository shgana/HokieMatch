import { NextRequest, NextResponse } from "next/server"

import { uploadDars } from "@/services/darsService"
import { darsUploadSchema } from "@/utils/validation"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = darsUploadSchema.parse(body)
    const report = await uploadDars(parsed)
    return NextResponse.json({ success: true, report })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message ?? "Failed to upload DARS" }, { status: 400 })
  }
}

