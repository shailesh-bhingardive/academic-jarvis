import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStudents, addStudent, updateStudent, deleteStudent } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

export const Route = createFileRoute("/students")({
  component: StudentsPage,
});

type Student = { id: string; name: string; roll_number: string; parent_contact: string | null; created_at: string };

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", roll_number: "", parent_contact: "" });

  const load = () => {
    setLoading(true);
    getStudents().then(setStudents).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateStudent(editId, form);
    } else {
      await addStudent(form);
    }
    setForm({ name: "", roll_number: "", parent_contact: "" });
    setShowForm(false);
    setEditId(null);
    load();
  };

  const handleEdit = (s: Student) => {
    setEditId(s.id);
    setForm({ name: s.name, roll_number: s.roll_number, parent_contact: s.parent_contact || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this student? This will also remove their attendance and marks records.")) {
      await deleteStudent(id);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student records</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", roll_number: "", parent_contact: "" }); }} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Student
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{editId ? "Edit Student" : "Add New Student"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input placeholder="Roll Number" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} required />
              <Input placeholder="Parent Contact" value={form.parent_contact} onChange={(e) => setForm({ ...form, parent_contact: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" size="sm"><Check className="h-4 w-4" /></Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-4 w-4" /></Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No students yet. Add your first student above.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Roll No</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Parent Contact</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2.5 px-2 font-medium">{s.name}</td>
                      <td className="py-2.5 px-2 text-muted-foreground">{s.roll_number}</td>
                      <td className="py-2.5 px-2 text-muted-foreground">{s.parent_contact || "—"}</td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </td>
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
