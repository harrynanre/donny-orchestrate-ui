import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FeatureStatus } from "@/lib/wiring";

interface LegendProps {
  className?: string;
}

const legendItems: { status: FeatureStatus; label: string; description: string }[] = [
  {
    status: "green",
    label: "Operational",
    description: "All checks passing, performance within SLO"
  },
  {
    status: "orange", 
    label: "Degraded",
    description: "Required checks pass, optional fail or SLO breach"
  },
  {
    status: "red",
    label: "Failed",
    description: "Required check failed (5xx/timeout/auth/schema)"
  },
  {
    status: "grey",
    label: "Disabled",
    description: "Feature intentionally disabled or not configured"
  }
];

const statusStyles = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-300",
  orange: "bg-amber-100 text-amber-800 border-amber-300 bg-gradient-to-r from-amber-100 to-amber-200",
  red: "bg-rose-100 text-rose-800 border-rose-300",
  grey: "bg-slate-100 text-slate-600 border-slate-300 border-dashed",
} as const;

function StatusDot({ status }: { status: FeatureStatus }) {
  const dotStyles = {
    green: "bg-emerald-500",
    orange: "bg-amber-500", 
    red: "bg-rose-500 animate-pulse",
    grey: "bg-slate-400",
  } as const;
  
  return <div className={cn("w-2 h-2 rounded-full flex-shrink-0", dotStyles[status])} />;
}

export function Legend({ className }: LegendProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Status Legend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {legendItems.map(({ status, label, description }) => (
          <div key={status} className="flex items-start gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <StatusDot status={status} />
              <Badge 
                variant="outline"
                className={cn("text-xs font-medium", statusStyles[status])}
              >
                {status.toUpperCase()}
              </Badge>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}