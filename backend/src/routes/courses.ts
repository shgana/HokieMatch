import { Router } from "express"

import { getAllCourses, getCourseById, searchCourses, getGradeDistributions } from "../services/courseService.ts"

const router = Router()

router.get("/all", async (_req, res) => {
  const data = await getAllCourses()
  res.json({ courses: data })
})

router.get("/search", async (req, res) => {
  const q = (req.query.q as string) ?? ""
  const data = await searchCourses(q)
  res.json({ results: data })
})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  const course = await getCourseById(id)
  if (!course) return res.status(404).json({ error: "Not found" })
  const grades = await getGradeDistributions(id)
  res.json({ course, grades })
})

export default router
