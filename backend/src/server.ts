import express from "express"
import cors from "cors"
import multer from "multer"
import * as dotenv from "dotenv"

import darsRoutes from "./routes/dars.ts"
import courseRoutes from "./routes/courses.ts"
import pathwayRoutes from "./routes/pathways.ts"
import recommendationRoutes from "./routes/recommendations.ts"
import picksRoutes from "./routes/picks.ts"
import compareRoutes from "./routes/compare.ts"

dotenv.config()

const app = express()
const upload = multer()

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_ORIGIN || ""].filter(Boolean),
    credentials: true,
  })
)
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(upload.any())

app.get("/health", (_req, res) => res.json({ ok: true }))
app.use("/api/dars", darsRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/pathways", pathwayRoutes)
app.use("/api/recommendations", recommendationRoutes)
app.use("/api/picks", picksRoutes)
app.use("/api/compare", compareRoutes)

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`HokieMatch backend running on port ${port}`)
})
