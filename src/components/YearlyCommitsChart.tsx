import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { RepoStats } from "@/lib/github";

interface YearlyCommitsChartProps {
  data: RepoStats[];
}

export function YearlyCommitsChart({ data }: YearlyCommitsChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Yearly Commit Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="yearlyCommits" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}