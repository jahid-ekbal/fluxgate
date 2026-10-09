"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/shadcnui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/shadcnui/chart";

export type DayPoint = { day: string; revenue: number; visits: number };

const config = {
  revenue: { label: "Revenue", color: "var(--primary)" },
  visits: { label: "Visits", color: "var(--primary)" },
} satisfies ChartConfig;

const AnalyticsCharts = ({ points }: { points: DayPoint[] }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card className="p-6">
      <h2 className="pb-3 text-lg font-semibold">Revenue, last 14 days</h2>
      <ChartContainer
        config={config}
        className="h-56 w-full">
        <AreaChart data={points}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            width={48}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="revenue"
            type="monotone"
            fill="var(--color-revenue)"
            fillOpacity={0.3}
            stroke="var(--color-revenue)"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
    <Card className="p-6">
      <h2 className="pb-3 text-lg font-semibold">Visits, last 14 days</h2>
      <ChartContainer
        config={config}
        className="h-56 w-full">
        <AreaChart data={points}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            width={48}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="visits"
            type="monotone"
            fill="var(--color-visits)"
            fillOpacity={0.3}
            stroke="var(--color-visits)"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  </div>
);

export default AnalyticsCharts;
