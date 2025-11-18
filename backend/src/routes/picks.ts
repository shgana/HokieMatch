import { Router } from "express"

import { addPick, getPicks, removePick } from "../services/picksService.ts"
import { addPickSchema, removePickSchema } from "../utils/validation.ts"

const router = Router()

router.get("/", async (req, res) => {
  const userId = req.query.userId as string
  if (!userId) return res.status(400).json({ error: "userId required" })
  const picks = await getPicks(userId)
  res.json({ picks })
})

router.post("/add", async (req, res) => {
  try {
    const parsed = addPickSchema.parse(req.body)
    const pick = await addPick(parsed.userId, parsed.courseId, parsed.note)
    res.json({ pick })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/remove", async (req, res) => {
  try {
    const parsed = removePickSchema.parse(req.body)
    await removePick(parsed.userId, parsed.courseId)
    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
