import { CheckCircle2, CircleDot, Clock3 } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { RequirementGroup } from "@/lib/types"

interface RequirementAccordionProps {
  groups: RequirementGroup[]
}

export function RequirementAccordion({ groups }: RequirementAccordionProps) {
  return (
    <Accordion type="multiple" className="rounded-2xl border border-border/80 bg-white/90 shadow-sm">
      {groups.map((group) => (
        <AccordionItem key={group.id} value={group.id} className="px-4">
          <AccordionTrigger className="py-4">
            <div className="flex items-center gap-3">
              {group.status === "Completed" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Clock3 className="h-5 w-5 text-[#E87722]" />
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{group.title}</p>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {group.courses.map((course) => (
                <Card
                  key={`${group.id}-${course.code}`}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={course.status === "Completed" ? "success" : "warning"}>
                        {course.status}
                      </Badge>
                      <p className="text-sm font-semibold text-foreground">{course.code}</p>
                      <span className="text-xs text-muted-foreground">• {course.credits} credits</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.title}</p>
                    {course.tag && (
                      <Badge variant="outline" className="w-fit border-dashed">
                        {course.tag}
                      </Badge>
                    )}
                  </div>
                  {course.status === "Completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <CircleDot className="h-5 w-5 text-[#861F41]" />
                  )}
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
