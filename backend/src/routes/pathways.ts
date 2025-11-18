import { Router } from "express"

import { getPathwayById, getPathwayCourses, getPathways } from "../services/pathwaysService.ts"

const router = Router()

router.get("/", async (_req, res) => {
  const data = await getPathways()
  res.json({ pathways: data })
})

router.get("/:id", async (req, res) => {
  const area = await getPathwayById(req.params.id)
  if (!area) return res.status(404).json({ error: "Not found" })
  res.json({ area })
})

router.get("/:id/courses", async (req, res) => {
  const courses = await getPathwayCourses(req.params.id)
  res.json({ courses })
})

export default router
