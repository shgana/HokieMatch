"use client"

import { useMemo } from "react"
import { Filter, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type PathwayFilters = {
  categories: string[]
  levels: string[]
  credits: string[]
  search: string
}

interface PathwayFilterSidebarProps {
  values: PathwayFilters
  onChange: (values: PathwayFilters) => void
}

const categoryOptions = ["Discourse", "Quantitative", "Creativity", "Citizenship"]
const levelOptions = ["1000/2000", "2000/3000", "3000", "Upper-level"]
const creditOptions = ["3", "6", "9+"]

export function PathwayFilterSidebar({ values, onChange }: PathwayFilterSidebarProps) {
  const appliedCount = useMemo(
    () =>
      values.categories.length + values.levels.length + values.credits.length + (values.search ? 1 : 0),
    [values]
  )

  const toggle = (key: keyof PathwayFilters, value: string) => {
    const current = values[key]
    if (Array.isArray(current)) {
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      onChange({ ...values, [key]: next })
    }
  }

  const reset = () =>
    onChange({
      categories: [],
      levels: [],
      credits: [],
      search: "",
    })

  return (
    <aside className="w-full max-w-[280px] space-y-4 rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#861F41]" />
          <p className="text-sm font-semibold text-foreground">Filters</p>
        </div>
        {appliedCount > 0 && <Badge variant="secondary">{appliedCount} applied</Badge>}
      </div>

      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Search</Label>
        <Input
          placeholder="Search areas or courses"
          value={values.search}
          onChange={(e) => onChange({ ...values, search: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Area</Label>
        {categoryOptions.map((option) => (
          <label key={option} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60">
            <Checkbox
              checked={values.categories.includes(option)}
              onCheckedChange={() => toggle("categories", option)}
            />
            <span className="text-sm text-foreground">{option}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Credit Hours</Label>
        {creditOptions.map((option) => (
          <label key={option} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60">
            <Checkbox
              checked={values.credits.includes(option)}
              onCheckedChange={() => toggle("credits", option)}
            />
            <span className="text-sm text-foreground">{option} credits</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Level</Label>
        {levelOptions.map((option) => (
          <label key={option} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60">
            <Checkbox
              checked={values.levels.includes(option)}
              onCheckedChange={() => toggle("levels", option)}
            />
            <span className="text-sm text-foreground">{option}</span>
          </label>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={reset}
      >
        <RotateCcw className="h-4 w-4" />
        Reset filters
      </Button>
    </aside>
  )
}
