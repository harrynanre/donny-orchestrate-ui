import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Feature, FeatureStatus, getFeatureReason } from "@/lib/wiring";

interface StatusTileProps {
  feature: Feature;
  className?: string;
  onClick?: () => void;
}

const statusStyles = {
  green: {
    card: "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
  },
  orange: {
    card: "border-amber-200 bg-amber-50/50 hover:bg-amber-50 bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100",
    badge: "bg-amber-100 text-amber-800 border-amber-300 bg-gradient-to-r from-amber-100 to-amber-200",
    dot: "bg-amber-500",
  },
  red: {
    card: "border-rose-200 bg-rose-50/50 hover:bg-rose-50 relative",
    badge: "bg-rose-100 text-rose-800 border-rose-300 relative",
    dot: "bg-rose-500 animate-pulse",
  },
  grey: {
    card: "border-slate-200 bg-slate-50/20 hover:bg-slate-50/40 border-dashed",
    badge: "bg-slate-100 text-slate-600 border-slate-300 border-dashed",
    dot: "bg-slate-400",
  },
} as const;

function StatusDot({ status }: { status: FeatureStatus }) {
  const style = statusStyles[status];
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", style.dot)} />
      {status === "red" && (
        <div className={cn("absolute w-2 h-2 rounded-full", style.dot, "animate-ping")} />
      )}
    </div>
  );
}

export function StatusTile({ feature, className, onClick }: StatusTileProps) {
  const reason = getFeatureReason(feature);
  const style = statusStyles[feature.status];
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        style.card,
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${feature.name}. Status: ${feature.status}. ${reason}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold leading-tight">
            {feature.name}
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusDot status={feature.status} />
            <Badge 
              variant="outline"
              className={cn("text-xs font-medium", style.badge)}
            >
              {feature.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className={cn(
          "text-sm leading-relaxed",
          feature.status === "green" ? "text-emerald-700" :
          feature.status === "orange" ? "text-amber-700" :
          feature.status === "red" ? "text-rose-700" :
          "text-slate-600"
        )}>
          {reason}
        </p>
      </CardContent>
    </Card>
  );
}