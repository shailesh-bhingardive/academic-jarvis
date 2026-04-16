import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStudents, getMarks, upsertMarks } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Save } from "lucide-react";

export const Route = createFileRoute("/marks")({
  component: MarksPage,
});

function MarksPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subject, setSubject] = useState("");
  const [internal, setInternal] = useState("");
  const [external, setExternal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getStudents(), getMarks()]).then(([s, m]) => {
      setStudents(s);
      setMarks(m);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !subject) return;
    setSaving(true);
    await upsertMarks({
      student_id: selectedStudent,
      subject,
      internal: parseInt(internal) || 0,
      external: parseInt(external) || 0,
    });
    const updated = await getMarks();
    setMarks(updated);
    setSubject("");
    setInternal("");
    setExternal("");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Group marks by student
  const marksByStudent: Record<string, any[]> = {};
  marks.forEach((m) => {
    if (!marksByStudent[m.student_id]) marksByStudent[m.student_id] = [];
    marksByStudent[m.student_id].push(m);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Marks</h1>
        <p className="text-sm text-muted-foreground mt-1">Add and manage subject-wise marks</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Add Marks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>
              ))}
            </select>
            <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <Input type="number" placeholder="Internal" value={internal} onChange={(e) => setInternal(e.target.value)} min="0" max="50" required />
            <Input type="number" placeholder="External" value={external} onChange={(e) => setExternal(e.target.value)} min="0" max="50" required />
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {students.map((s) => {
        const sMarks = marksByStudent[s.id];
        if (!sMarks || sMarks.length === 0) return null;
        const total = sMarks.reduce((sum: number, m: any) => sum + m.internal + m.external, 0);
        const maxMarks = sMarks.length * 100;
        const pct = Math.round((total / maxMarks) * 100);

        return (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{s.name} ({s.roll_number})</CardTitle>
                <span className="text-sm font-bold">{total}/{maxMarks} ({pct}%)</span>
              </div>
            </CardHeader>
            <CardContent>
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
                  {sMarks.map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-1.5">{m.subject}</td>
                      <td className="py-1.5 text-right">{m.internal}</td>
                      <td className="py-1.5 text-right">{m.external}</td>
                      <td className="py-1.5 text-right font-medium">{m.internal + m.external}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
