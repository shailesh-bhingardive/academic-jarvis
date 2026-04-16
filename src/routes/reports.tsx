import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDashboardData, getMarks, getAttendanceStats } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    getDashboardData().then(setData).finally(() => setLoading(false));
  }, []);

  const generateReport = async (studentId: string) => {
    setSelectedStudent(studentId);
    const [marks, attStats] = await Promise.all([
      getMarks(studentId),
      getAttendanceStats(studentId),
    ]);
    const student = data.students.find((s: any) => s.id === studentId);
    setReport({ student, marks, attStats });
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and download student reports</p>
      </div>

      <div className="grid gap-3">
        {data?.students.map((s: any) => (
          <Card
            key={s.id}
            className={`cursor-pointer transition-colors hover:border-primary/50 ${selectedStudent === s.id ? "border-primary" : ""}`}
            onClick={() => generateReport(s.id)}
          >
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.roll_number} • Rank #{s.rank}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {report && (
        <Card className="print:shadow-none print:border-none" id="student-report">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Report: {report.student.name}</CardTitle>
            <Button onClick={printReport} size="sm" variant="outline" className="print:hidden">
              <Download className="h-4 w-4 mr-1" /> Print / PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{report.student.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Roll Number:</span>
                <span className="ml-2 font-medium">{report.student.roll_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Parent Contact:</span>
                <span className="ml-2 font-medium">{report.student.parent_contact || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rank:</span>
                <span className="ml-2 font-medium">#{report.student.rank}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Attendance</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Days</p>
                  <p className="text-lg font-bold">{report.attStats.total}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Present</p>
                  <p className="text-lg font-bold">{report.attStats.present}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${report.attStats.percentage < 75 ? "bg-destructive/10" : "bg-success/10"}`}>
                  <p className="text-xs text-muted-foreground">Percentage</p>
                  <p className={`text-lg font-bold ${report.attStats.percentage < 75 ? "text-destructive" : "text-success"}`}>
                    {report.attStats.percentage}%
                  </p>
                </div>
              </div>
              {report.attStats.percentage < 75 && report.attStats.percentage > 0 && (
                <p className="text-xs text-destructive mt-2 font-medium">
                  ⚠️ Attendance below 75% — Email/SMS alert sent to parent at {report.student.parent_contact || "N/A"}
                </p>
              )}
            </div>

            {report.marks.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Academic Records</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 font-medium text-muted-foreground">Subject</th>
                      <th className="text-right py-1.5 font-medium text-muted-foreground">Internal</th>
                      <th className="text-right py-1.5 font-medium text-muted-foreground">External</th>
                      <th className="text-right py-1.5 font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.marks.map((m: any) => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="py-1.5">{m.subject}</td>
                        <td className="py-1.5 text-right">{m.internal}</td>
                        <td className="py-1.5 text-right">{m.external}</td>
                        <td className="py-1.5 text-right font-medium">{m.internal + m.external}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
