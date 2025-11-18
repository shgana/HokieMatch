import { Router } from "express"

import { compareCourses } from "../services/compareService.ts"
import { compareSchema } from "../utils/validation.ts"

const router = Router()

router.post("/", async (req, res) => {
  try {
    const parsed = compareSchema.parse(req.body)
    const payload = await compareCourses(parsed.courseIds)
    res.json({ comparison: payload })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
