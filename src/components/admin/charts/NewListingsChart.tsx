import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { day: "01", listings: 4000 },
  { day: "03", listings: 5500 },
  { day: "06", listings: 6000 },
  { day: "09", listings: 7000 },
  { day: "12", listings: 6500 },
  { day: "15", listings: 7200 },
  { day: "18", listings: 6800 },
  { day: "21", listings: 5900 },
  { day: "24", listings: 6200 },
  { day: "27", listings: 6900 },
  { day: "30", listings: 7500 },
];

export const NewListingsChart = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="font-semibold">New Listings</h3>
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
            listings: {
              label: "Listings",
              color: "hsl(var(--accent))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="listings" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
