import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const data = [
  { date: "01", revenue: 150000, profit: 120000 },
  { date: "03", revenue: 180000, profit: 145000 },
  { date: "06", revenue: 220000, profit: 175000 },
  { date: "09", revenue: 195000, profit: 160000 },
  { date: "12", revenue: 240000, profit: 190000 },
  { date: "15", revenue: 210000, profit: 170000 },
  { date: "18", revenue: 280000, profit: 225000 },
  { date: "21", revenue: 250000, profit: 200000 },
  { date: "24", revenue: 230000, profit: 185000 },
  { date: "27", revenue: 260000, profit: 210000 },
  { date: "30", revenue: 275000, profit: 220000 },
];

export const RevenueChart = () => {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <h3 className="font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold">2,129,585</p>
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className="text-accent flex items-center gap-1">
              15% <TrendingUp className="w-3 h-3" />
            </span>
            <span className="text-muted-foreground">Over All Profit</span>
          </div>
        </div>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue",
              color: "hsl(var(--accent))",
            },
            profit: {
              label: "Profit",
              color: "hsl(72 100% 51% / 0.3)",
            },
          }}
          className="h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="profit" stroke="hsl(72 100% 51% / 0.5)" strokeDasharray="3 3" fill="none" strokeWidth={2} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
