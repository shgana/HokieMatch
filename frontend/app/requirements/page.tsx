"use client"

import { useEffect, useMemo, useState } from "react"
import { ClipboardList } from "lucide-react"

import { RequirementAccordion } from "@/components/RequirementAccordion"
import { Sidebar } from "@/components/Sidebar"
import { TopNav } from "@/components/TopNav"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiGet } from "@/lib/api"
import type { RemainingRequirement, RequirementGroup as ReqType } from "@/lib/types"

const DEFAULT_USER =
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001"

type UiRequirement = {
  id: string
  title: string
  status: "Completed" | "Remaining" | "InProgress"
  description?: string
  courses: { code: string; title: string; credits: number; status: "Completed" | "Remaining"; tag?: string }[]
}

export default function RequirementsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<UiRequirement[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { requirements, remaining } = await apiGet<{
          requirements: ReqType[]
          remaining: RemainingRequirement[]
        }>("/api/dars/requirements", { userId: DEFAULT_USER })

        const remByReq: Record<string, RemainingRequirement[]> = {}
        remaining?.forEach((r) => {
          const key = r.requirement_id ?? "unknown"
          remByReq[key] = remByReq[key] ? [...remByReq[key], r] : [r]
        })

        const uiGroups: UiRequirement[] = (requirements ?? []).map((r) => {
          const options = remByReq[r.id] ?? []
          return {
            id: r.id,
            title: r.group_name,
            status: r.status,
            description: typeof r.details === "string" ? r.details : undefined,
            courses: options.flatMap((opt) =>
              (opt.course_options ?? []).map((c) => ({
                code: c,
                title: "Option",
                credits: opt.credits_needed ?? 0,
                status: "Remaining" as const,
                tag: opt.notes ?? undefined,
              }))
            ),
          }
        })

        if (!mounted) return
        setGroups(uiGroups)
        setLoading(false)
      } catch (err: any) {
        if (!mounted) return
        setError(err.message ?? "Failed to fetch requirements")
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const completed = useMemo(() => groups.filter((g) => g.status === "Completed"), [groups])
  const remaining = useMemo(() => groups.filter((g) => g.status === "Remaining"), [groups])

  return (
    <div className="flex min-h-screen gap-6">
      <Sidebar />
      <main className="flex-1 space-y-6 px-4 pb-10 lg:px-6">
        <TopNav
          title="Requirements"
          subtitle="Tabs for completed vs remaining, live from Supabase."
        />

        {loading ? (
          <p>Loading requirements...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <Tabs defaultValue="remaining" className="space-y-4">
            <TabsList>
              <TabsTrigger value="remaining">Remaining</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="remaining">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#861F41]" />
                <p className="text-sm text-muted-foreground">
                  Requirement groups still open. Populated from /api/dars/requirements.
                </p>
              </div>
              <RequirementAccordion groups={remaining} />
            </TabsContent>

            <TabsContent value="completed">
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="success">Done</Badge>
                <p className="text-sm text-muted-foreground">
                  Completed items come from your parsed DARS.
                </p>
              </div>
              <RequirementAccordion groups={completed} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
