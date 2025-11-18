"use client"

import Link from "next/link"
import { Bell, FileUp, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TopNavProps {
  title?: string
  subtitle?: string
}

export function TopNav({ title, subtitle }: TopNavProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border/60 bg-white/80 px-4 py-3 backdrop-blur-md lg:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            HokieMatch
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{title ?? "Dashboard"}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </Button>
          <Link href="/upload">
            <Button size="sm" className="gap-2 bg-[#861F41] text-white hover:bg-[#6f1935]">
              <FileUp className="h-4 w-4" />
              Upload DARS
            </Button>
          </Link>
          <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#861F41]/10 text-[#861F41]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Shyam</p>
              <p className="text-[11px] text-muted-foreground">CS @ Virginia Tech</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 px-3 py-2 shadow-inner">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="border-none bg-transparent focus-visible:ring-0"
          placeholder="Search courses, instructors, or requirements"
        />
      </div>
    </header>
  )
}
