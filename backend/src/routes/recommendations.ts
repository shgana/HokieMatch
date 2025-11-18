import { Router } from "express"

import {
  getEasyCourses,
  getPathwaysRecommendations,
  getRecommendationsForUser,
} from "../services/recommendationService.ts"

const router = Router()

router.get("/easy-courses", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const results = await getEasyCourses({ limit })
  res.json({ results })
})

router.get("/for-user", async (req, res) => {
  const userId = req.query.userId as string
  if (!userId) return res.status(400).json({ error: "userId required" })
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const results = await getRecommendationsForUser(userId, limit ?? 15)
  res.json({ results })
})

router.get("/pathways", async (req, res) => {
  const ids = (req.query.ids as string)?.split(",").filter(Boolean) ?? []
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const results = await getPathwaysRecommendations(ids, limit ?? 10)
  res.json({ results })
})

export default router
