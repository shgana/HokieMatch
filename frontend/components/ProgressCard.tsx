import { ReactNode } from "react"
import { Circle, Gauge, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  progress?: number
  badge?: string
}

export function ProgressCard({
  title,
  value,
  description,
  icon,
  progress,
  badge,
}: ProgressCardProps) {
  return (
    <Card className="rounded-2xl border border-border/80 bg-white/90 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <CardTitle className="text-2xl font-bold text-foreground">{value}</CardTitle>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#861F41]/10 to-[#E87722]/10 text-[#861F41]">
          {icon ?? <Circle className="h-4 w-4" />}
        </div>
      </CardHeader>
      {description && (
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{description}</p>
          {typeof progress === "number" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          {badge && <Badge variant="outline">{badge}</Badge>}
        </CardContent>
      )}
    </Card>
  )
}
