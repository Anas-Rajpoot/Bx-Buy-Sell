import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  period: string;
}

export const StatCard = ({ title, value, change, period }: StatCardProps) => {
  return (
    <Card className="p-4 sm:p-6">
      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">{value}</p>
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <span className="text-accent flex items-center gap-1">
          {change} <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </span>
        <span className="text-muted-foreground">{period}</span>
      </div>
    </Card>
  );
};
