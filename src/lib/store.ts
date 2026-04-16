import { supabase } from "@/integrations/supabase/client";

// ── Students ──
export async function getStudents() {
  const { data, error } = await supabase.from("students").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function addStudent(student: { name: string; roll_number: string; parent_contact?: string }) {
  const { data, error } = await supabase.from("students").insert(student).select().single();
  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, student: { name?: string; roll_number?: string; parent_contact?: string }) {
  const { data, error } = await supabase.from("students").update(student).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function searchStudents(query: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .or(`name.ilike.%${query}%,roll_number.ilike.%${query}%`)
    .order("name");
  if (error) throw error;
  return data;
}

// ── Attendance ──
export async function getAttendance(studentId?: string) {
  let q = supabase.from("attendance").select("*, students(name, roll_number)").order("date", { ascending: false });
  if (studentId) q = q.eq("student_id", studentId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function markAttendance(records: { student_id: string; date: string; status: string }[]) {
  const { error } = await supabase.from("attendance").upsert(records, { onConflict: "student_id,date" });
  if (error) throw error;
}

export async function getAttendanceStats(studentId: string) {
  const { data, error } = await supabase.from("attendance").select("status").eq("student_id", studentId);
  if (error) throw error;
  const total = data.length;
  const present = data.filter((r) => r.status === "Present").length;
  return { total, present, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
}

// ── Marks ──
export async function getMarks(studentId?: string) {
  let q = supabase.from("marks").select("*, students(name, roll_number)");
  if (studentId) q = q.eq("student_id", studentId);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function upsertMarks(record: { student_id: string; subject: string; internal: number; external: number }) {
  const { error } = await supabase.from("marks").upsert(record, { onConflict: "student_id,subject" });
  if (error) throw error;
}

// ── Dashboard Stats ──
export async function getDashboardData() {
  const [studentsRes, attendanceRes, marksRes] = await Promise.all([
    supabase.from("students").select("*"),
    supabase.from("attendance").select("*"),
    supabase.from("marks").select("*"),
  ]);
  if (studentsRes.error) throw studentsRes.error;
  if (attendanceRes.error) throw attendanceRes.error;
  if (marksRes.error) throw marksRes.error;

  const students = studentsRes.data;
  const attendance = attendanceRes.data;
  const marks = marksRes.data;

  // Calculate per-student stats
  const studentStats = students.map((s) => {
    const att = attendance.filter((a) => a.student_id === s.id);
    const total = att.length;
    const present = att.filter((a) => a.status === "Present").length;
    const attPct = total > 0 ? Math.round((present / total) * 100) : 0;

    const studentMarks = marks.filter((m) => m.student_id === s.id);
    const totalMarks = studentMarks.reduce((sum, m) => sum + m.internal + m.external, 0);
    const maxMarks = studentMarks.length * 100; // assuming max 100 per subject
    const marksPct = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

    return {
      ...s,
      attendancePercentage: attPct,
      totalMarks,
      marksPercentage: marksPct,
      subjectCount: studentMarks.length,
    };
  });

  // Rank by total marks
  const ranked = [...studentStats].sort((a, b) => b.totalMarks - a.totalMarks).map((s, i) => ({ ...s, rank: i + 1 }));

  return {
    students: ranked,
    totalStudents: students.length,
    totalAttendanceRecords: attendance.length,
    lowAttendance: ranked.filter((s) => s.attendancePercentage < 75 && s.attendancePercentage > 0),
    top3: ranked.slice(0, 3),
  };
}
