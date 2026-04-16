import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStudents, markAttendance, getAttendance } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarCheck, Save } from "lucide-react";

export const Route = createFileRoute("/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getStudents(), getAttendance()]).then(([s, h]) => {
      setStudents(s);
      setHistory(h);
      // Pre-fill today's attendance if exists
      const todayRecords: Record<string, string> = {};
      h.filter((r: any) => r.date === date).forEach((r: any) => {
        todayRecords[r.student_id] = r.status;
      });
      setRecords(todayRecords);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Update pre-fill when date changes
    const dateRecords: Record<string, string> = {};
    history.filter((r) => r.date === date).forEach((r) => {
      dateRecords[r.student_id] = r.status;
    });
    setRecords(dateRecords);
  }, [date, history]);

  const handleSave = async () => {
    setSaving(true);
    const entries = students.map((s) => ({
      student_id: s.id,
      date,
      status: records[s.id] || "Absent",
    }));
    await markAttendance(entries);
    const updated = await getAttendance();
    setHistory(updated);
    setSaving(false);
  };

  const toggleStatus = (studentId: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present",
    }));
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
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">Mark and view daily attendance</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" /> Mark Attendance
            </CardTitle>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No students yet. Add students first.</p>
          ) : (
            <>
              <div className="space-y-2">
                {students.map((s) => {
                  const status = records[s.id] || "Absent";
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleStatus(s.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        status === "Present"
                          ? "bg-success/10 border-success/30"
                          : "bg-destructive/5 border-destructive/20"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.roll_number}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status === "Present"
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Button onClick={handleSave} className="mt-4 w-full" disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
