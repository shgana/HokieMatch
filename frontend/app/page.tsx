import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileUp,
  GraduationCap,
  LineChart,
  Sparkles,
  UploadCloud,
  Waypoints,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const highlights = [
  {
    title: "Upload DARS",
    description: "Drop in your latest DARS PDF to trigger parsing and generate requirement coverage.",
    icon: UploadCloud,
  },
  {
    title: "Smart Picks",
    description: "Curated GPA-friendly courses, grade distributions, and instructor history in one place.",
    icon: Sparkles,
  },
  {
    title: "Pathways Clarity",
    description: "See VT Pathways areas, credits, and which electives unlock multiple requirements.",
    icon: Waypoints,
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-[#f6f7fb]">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#861F41] to-[#E87722] text-white shadow-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">HokieMatch</p>
              <p className="text-xs text-muted-foreground">Virginia Tech planner</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden sm:inline-flex">
                View dashboard
              </Button>
            </Link>
            <Link href="/upload">
              <Button className="gap-2 bg-[#861F41] text-white hover:bg-[#6f1935]">
                <FileUp className="h-4 w-4" />
                Upload DARS
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate overflow-hidden py-16 sm:py-20">
          <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-[#E87722]/10 text-[#861F41]">
                VT Pathways • GPA-aware suggestions
              </Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Plan your VT journey with GPA-smart picks.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  HokieMatch visualizes your DARS progress, Pathways requirements, grade trends, and instructor history
                  — all with mock data so you can see the full experience before plugging in a real backend.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/upload">
                  <Button size="lg" className="gap-2 bg-[#861F41] text-white hover:bg-[#6f1935]">
                    <UploadCloud className="h-4 w-4" />
                    Upload DARS
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2 border-[#861F41] text-[#861F41]">
                    Explore dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <p className="text-sm text-muted-foreground">
                  Mock-only experience — drag & drop, charts, and tables are fully interactive with placeholder data.
                </p>
              </div>
            </div>

            <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-white/90 shadow-xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-foreground">Preview Dashboard</CardTitle>
                  <Badge variant="secondary">Maroon / Orange</Badge>
                </div>
                <CardDescription>Completed hours, Pathways snapshot, and GPA trend (mocked).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-gradient-to-br from-[#861F41]/10 to-white p-3">
                    <p className="text-xs text-muted-foreground">Completed Hours</p>
                    <p className="text-2xl font-bold text-foreground">78</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[#E87722]/10 to-white p-3">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold text-foreground">42</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-white p-3">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold text-foreground">65%</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-[#861F41]/30 bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <LineChart className="h-4 w-4 text-[#861F41]" />
                    GPA trend
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Interactive Recharts line graph shows mock GPA movement over terms.
                  </p>
                  <div className="h-28 rounded-xl bg-gradient-to-r from-[#861F41]/15 via-white to-[#E87722]/15" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#861F41]/5 px-4 py-3 text-sm font-semibold text-[#861F41]">
                  <span>Next up: Technical Writing (Pathways 1A)</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-foreground shadow-sm">Mock data</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-[#861F41] py-14 text-white">
          <div className="container mx-auto grid gap-6 px-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="text-sm text-white/80">{item.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="container mx-auto space-y-10 px-4">
            <div className="flex flex-col gap-3 text-center">
              <Badge variant="outline" className="mx-auto w-fit border-[#861F41] text-[#861F41]">
                Why HokieMatch?
              </Badge>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Built for Virginia Tech students</h2>
              <p className="text-lg text-muted-foreground">
                Explore the full UI — landing to comparisons — with mocked data, charts, dropzones, and tables.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-2xl border border-border/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <BarChart3 className="h-5 w-5 text-[#E87722]" />
                    Requirements visualized
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Completed vs remaining requirements in tabs with accordions and status badges.</p>
                  <p>Shows Pathways coverage, credits, and mock grades.</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border border-border/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Sparkles className="h-5 w-5 text-[#861F41]" />
                    Easy-course finder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Sortable table with GPA badges, workload tags, and add-to-picks actions.</p>
                  <p>Mocked grade distribution charts and instructor lists per course.</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border border-border/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                    <Waypoints className="h-5 w-5 text-[#E87722]" />
                    Pathways explorer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Filtering sidebar, card grid, and modal course lists powered by mock Pathways data.</p>
                  <p>VT-inspired maroon/orange palette with rounded corners and soft shadows.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-white/90 py-8">
        <div className="container mx-auto flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#861F41]" />
            <p className="text-sm text-muted-foreground">
              HokieMatch — mock frontend only. VT maroon (#861F41) and orange (#E87722).
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/upload" className="hover:text-foreground">
              Upload
            </Link>
            <Link href="/recommendations" className="hover:text-foreground">
              Recommendations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
