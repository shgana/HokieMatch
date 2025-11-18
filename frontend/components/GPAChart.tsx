"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface GPAChartProps {
  data: { term: string; gpa: number }[]
  height?: number
}

export function GPAChart({ data, height = 200 }: GPAChartProps) {
  return (
    <div className="h-full w-full rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
      <div className="h-[180px]" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="term" tickLine={false} />
            <YAxis domain={[2.5, 4.0]} tickCount={4} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                borderColor: "hsl(var(--border))",
              }}
            />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="#861F41"
              strokeWidth={2.6}
              dot={{ r: 4, fill: "#E87722", stroke: "#861F41", strokeWidth: 1.5 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
