import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, BookOpen, AlertTriangle, Trophy, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Failed to load data.</p>;

  const COLORS = ["oklch(0.45 0.2 260)", "oklch(0.6 0.2 150)", "oklch(0.75 0.18 60)", "oklch(0.55 0.25 27)"];

  const attendanceChartData = data.students.slice(0, 10).map((s) => ({
    name: s.name.split(" ")[0],
    attendance: s.attendancePercentage,
  }));

  const marksChartData = data.students.slice(0, 10).map((s) => ({
    name: s.name.split(" ")[0],
    marks: s.totalMarks,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of student attendance and performance</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} />
        <StatCard icon={CalendarCheck} label="Attendance Records" value={data.totalAttendanceRecords} />
        <StatCard icon={AlertTriangle} label="Low Attendance" value={data.lowAttendance.length} variant="warning" />
        <StatCard icon={Trophy} label="Top Scorer" value={data.top3[0]?.name?.split(" ")[0] || "N/A"} />
      </div>

      {/* Low attendance warning */}
      {data.lowAttendance.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Attendance Warning (&lt;75%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowAttendance.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-destructive font-bold">{s.attendancePercentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 students */}
      {data.top3.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-chart-3" /> Top Students
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.top3.map((s, i) => (
              <Card key={s.id} className={`${i === 0 ? "border-chart-3/50 bg-chart-3/5" : ""}`}>
                <CardContent className="pt-4 pb-4 text-center">
                  <div className={`text-2xl font-bold mb-1 ${i === 0 ? "text-chart-3" : "text-muted-foreground"}`}>
                    #{i + 1}
                  </div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.totalMarks} marks • {s.attendancePercentage}% att.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="oklch(0.45 0.2 260)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No attendance data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Marks Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {marksChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={marksChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="marks" fill="oklch(0.6 0.2 150)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No marks data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All students table */}
      {data.students.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Student Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Roll No</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Attendance</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 px-2 font-bold">#{s.rank}</td>
                      <td className="py-2 px-2">{s.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{s.roll_number}</td>
                      <td className={`py-2 px-2 text-right font-medium ${s.attendancePercentage < 75 ? "text-destructive" : ""}`}>
                        {s.attendancePercentage}%
                      </td>
                      <td className="py-2 px-2 text-right">{s.totalMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  variant?: "warning";
}) {
  return (
    <Card className={variant === "warning" ? "border-destructive/30" : ""}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${variant === "warning" ? "bg-destructive/10" : "bg-primary/10"}`}>
            <Icon className={`h-4 w-4 ${variant === "warning" ? "text-destructive" : "text-primary"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{typeof value === "number" ? value : value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
