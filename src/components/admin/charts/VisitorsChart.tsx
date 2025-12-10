import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { day: "01", visitors: 2000 },
  { day: "03", visitors: 2500 },
  { day: "06", visitors: 3500 },
  { day: "09", visitors: 4500 },
  { day: "12", visitors: 3800 },
  { day: "15", visitors: 5500 },
  { day: "18", visitors: 4200 },
  { day: "21", visitors: 4800 },
  { day: "24", visitors: 3900 },
  { day: "27", visitors: 4100 },
  { day: "30", visitors: 3200 },
];

export const VisitorsChart = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="font-semibold">Visitors</h3>
        <div className="flex gap-2">
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
          <Select defaultValue="device">
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="device">Device</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="desktop">Desktop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            visitors: {
              label: "Visitors",
              color: "hsl(var(--accent))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="visitors" stroke="hsl(var(--accent))" fill="url(#colorVisitors)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
