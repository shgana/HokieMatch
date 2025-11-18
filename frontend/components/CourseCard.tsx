"use client"

import { BookOpen, Plus, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Course } from "@/lib/types"

interface CourseCardProps {
  course: Course
  onAdd?: (course: Course) => void
  muted?: boolean
  showDescription?: boolean
}

export function CourseCard({ course, onAdd, muted, showDescription }: CourseCardProps) {
  return (
    <Card className="h-full border border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{course.code ?? course.id}</p>
          <CardTitle className="text-lg text-foreground">{course.title}</CardTitle>
        </div>
        <Badge
          variant={
            course.difficulty === "Easy"
              ? "success"
              : course.difficulty === "Medium"
                ? "info"
                : "warning"
          }
          className="capitalize"
        >
          {course.difficulty ?? "Medium"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-amber-500" />
          <span>Avg GPA {course.gpa ? course.gpa.toFixed(2) : "—"}</span>
          <span className="mx-1">•</span>
          <span>{course.credits} credits</span>
        </div>
        {showDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {course.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="border-dashed">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Instructors</span>
            <span>{course.instructors?.join(", ") ?? "N/A"}</span>
          </div>
          {onAdd && (
            <Button
              size="sm"
              variant={muted ? "outline" : "default"}
              className={muted ? "" : "bg-[#861F41] hover:bg-[#6f1935] text-white"}
              onClick={() => onAdd(course)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to My Picks
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <BookOpen className="h-4 w-4 text-[#E87722]" />
          Pathways: {course.pathways.join(", ")}
        </div>
      </CardContent>
    </Card>
  )
}
