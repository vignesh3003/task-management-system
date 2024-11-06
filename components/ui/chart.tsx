"use client";

import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config: Record<string, { label: string; color: string }>;
}

export function ChartContainer({
  className,
  config,
  children,
  ...props
}: ChartProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <style jsx global>{`
        :root {
          ${Object.entries(config)
            .map(([key, value]) => `--color-${key}: ${value.color};`)
            .join("\n")}
        }
      `}</style>
      {children}
      <div className="flex items-center gap-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: value.color }}
            />
            <div className="text-sm text-muted-foreground">{value.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload) return null;

  return (
    <Card className="p-2 border shadow-sm">
      <div className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </div>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: item.color }}
          />
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </Card>
  );
}

export {
  RechartsLineChart as LineChart,
  RechartsBarChart as BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
};
