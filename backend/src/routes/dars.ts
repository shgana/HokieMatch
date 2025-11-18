import { Router } from "express"

import { getDarsSummary, getRemaining, getRequirements, uploadDars } from "../services/darsService.ts"

const router = Router()

router.post("/upload", async (req, res) => {
  try {
    const report = await uploadDars(req.body)
    res.json({ success: true, report })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.get("/summary", async (req, res) => {
  const userId = req.query.userId as string
  if (!userId) return res.status(400).json({ error: "userId required" })
  try {
    const summary = await getDarsSummary(userId)
    res.json({ summary })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.get("/requirements", async (req, res) => {
  const userId = req.query.userId as string
  if (!userId) return res.status(400).json({ error: "userId required" })
  try {
    const requirements = await getRequirements(userId)
    const remaining = await getRemaining(userId)
    res.json({ requirements, remaining })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
