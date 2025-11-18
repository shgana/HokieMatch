"use client"

import { useMemo, useState } from "react"
import { ArrowDownUp, Plus, Star, Tags } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Course } from "@/lib/types"

type RecommendationRow = {
  course: Course
  reason: string
  workload: string
  gpa?: number
  difficulty?: "Easy" | "Medium" | "Hard"
  pathways?: string[]
}

type SortKey = "gpa" | "difficulty" | "code"

interface RecommendationsTableProps {
  rows: RecommendationRow[]
  onAdd?: (course: Course) => void
}

const difficultyRank = { Easy: 1, Medium: 2, Hard: 3 }

export function RecommendationsTable({ rows, onAdd }: RecommendationsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("gpa")
  const [direction, setDirection] = useState<"asc" | "desc">("desc")

  const sorted = useMemo(() => {
    const sortedRows = [...rows].sort((a, b) => {
      if (sortKey === "gpa") return ((a.gpa ?? 0) - (b.gpa ?? 0)) * (direction === "asc" ? 1 : -1)
      if (sortKey === "difficulty")
        return (difficultyRank[(a.difficulty ?? "Medium")] - difficultyRank[(b.difficulty ?? "Medium")]) *
          (direction === "asc" ? 1 : -1)
      return a.course.code.localeCompare(b.course.code) * (direction === "asc" ? 1 : -1)
    })
    return sortedRows
  }, [rows, sortKey, direction])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setDirection("desc")
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-border/80 bg-white/90 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">
              <button className="flex items-center gap-1" onClick={() => toggleSort("code")}>
                Course <ArrowDownUp className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[120px]">
              <button className="flex items-center gap-1" onClick={() => toggleSort("gpa")}>
                Avg GPA <ArrowDownUp className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead className="w-[120px]">
              <button className="flex items-center gap-1" onClick={() => toggleSort("difficulty")}>
                Difficulty <ArrowDownUp className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>Why it fits</TableHead>
            <TableHead className="w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.course.id}>
              <TableCell className="font-semibold text-foreground">{row.course.code ?? row.course.id}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">{row.course.title}</span>
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                    <Tags className="h-3.5 w-3.5 text-[#E87722]" />
                    {row.course.tags.slice(0, 3).join(" • ")}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  <Star className="mr-1 h-3.5 w-3.5 text-amber-500" />
                  {(row.gpa ?? 0).toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    (row.difficulty ?? "Medium") === "Easy"
                      ? "success"
                      : (row.difficulty ?? "Medium") === "Medium"
                        ? "info"
                        : "warning"
                  }
                >
                  {row.difficulty ?? "Medium"}
                </Badge>
              </TableCell>
              <TableCell>
                <p className="text-sm text-muted-foreground">{row.reason}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(row.pathways ?? row.course.pathways ?? []).map((p) => (
                    <Badge key={p} variant="outline">
                      Pathways {p}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="border-dashed">
                    Workload: {row.workload}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {onAdd && (
                  <Button
                    size="sm"
                    className="w-full bg-[#861F41] text-white hover:bg-[#6f1935]"
                    onClick={() => onAdd(row.course)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to My Picks
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Mock recommendations generated from grade distributions and Pathways fit.</TableCaption>
      </Table>
    </Card>
  )
}
