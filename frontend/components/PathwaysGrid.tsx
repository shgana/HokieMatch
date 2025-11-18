"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Map, Waypoints } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Course, PathwayArea } from "@/lib/types"

interface PathwaysGridProps {
  pathways: PathwayArea[]
  courses: Course[]
  search?: string
}

export function PathwaysGrid({ pathways, courses, search }: PathwaysGridProps) {
  const [activeArea, setActiveArea] = useState<PathwayArea | null>(null)

  const filtered = useMemo(() => {
    if (!search) return pathways
    return pathways.filter(
      (area) =>
        area.name.toLowerCase().includes(search.toLowerCase()) ||
        (area.courses ?? []).some((code) => code.toLowerCase().includes(search.toLowerCase()))
    )
  }, [pathways, search])

  const courseLookup = useMemo(() => {
    const map: Record<string, Course> = {}
    courses.forEach((c) => (map[c.code] = c))
    return map
  }, [courses])

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((area) => (
          <Card
            key={area.id}
            className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-white to-muted/60 shadow-sm"
          >
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-[#861F41]/30 text-[#861F41]">
                  {area.category}
                </Badge>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Map className="h-4 w-4" />
                  {area.level ?? "Paths"}
                </div>
              </div>
              <CardTitle className="text-lg text-foreground">{area.name}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{area.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{area.credits_required ?? 0} credits</Badge>
                <Badge variant="outline" className="border-dashed">
                  {(area.courses ?? []).length} courses
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(area.courses ?? []).slice(0, 4).map((code) => (
                  <Badge key={code} variant="outline" className="rounded-full border-dashed">
                    {code}
                  </Badge>
                ))}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between bg-white/70 text-[#861F41] hover:bg-[#861F41]/10"
                    onClick={() => setActiveArea(area)}
                  >
                    View courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      <Waypoints className="h-5 w-5 text-[#861F41]" />
                      {activeArea?.name ?? area.name}
                    </DialogTitle>
                    <DialogDescription>{activeArea?.description ?? area.description}</DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-3">
                    {(activeArea?.courses ?? area.courses ?? []).map((code) => {
                      const course = courseLookup[code]
                      return (
                        <div
                          key={code}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{code}</p>
                            <p className="text-xs text-muted-foreground">
                              {course ? course.title : "Pathways elective"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {course?.gpa ? `${course.gpa.toFixed(2)} GPA` : `${area.credits_required ?? 0} credits`}
                            </Badge>
                            <Badge variant="outline" className="border-dashed">
                              {course?.difficulty ?? "TBD"}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
