"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  GraduationCap,
  Home,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  UploadCloud,
  Waypoints,
  CheckSquare,
  Star,
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Landing", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/requirements", label: "Requirements", icon: ListChecks },
  { href: "/pathways", label: "Pathways", icon: Waypoints },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/compare", label: "Compare", icon: Compass },
  { href: "/mypicks", label: "My Picks", icon: Star },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-border/80 bg-white/90 px-5 py-6 shadow-sm backdrop-blur-md lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-3 pb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#861F41] to-[#E87722] text-white shadow-lg">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">HokieMatch</p>
          <span className="text-xs text-muted-foreground">VT Degree Companion</span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-gradient-to-r from-[#861F41]/90 to-[#E87722]/90 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border transition",
                  active
                    ? "border-white/30 bg-white/10"
                    : "border-border bg-white/60 text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#861F41] to-[#E87722] p-4 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-white/10 p-2">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Quick next step</p>
            <p className="text-xs text-white/80">
              Upload your latest DARS to refresh requirements and picks.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center text-xs font-semibold text-white underline-offset-2 hover:underline"
            >
              Upload DARS →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
