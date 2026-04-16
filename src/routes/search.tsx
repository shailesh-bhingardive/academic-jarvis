import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { searchStudents, getAttendanceStats, getMarks } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    const students = await searchStudents(q);
    // Enrich with stats
    const enriched = await Promise.all(
      students.map(async (s) => {
        const [att, marks] = await Promise.all([
          getAttendanceStats(s.id),
          getMarks(s.id),
        ]);
        const totalMarks = marks.reduce((sum: number, m: any) => sum + m.internal + m.external, 0);
        return { ...s, att, totalMarks };
      })
    );
    setResults(enriched);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Search by name or roll number</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type student name or roll number..."
          className="pl-10"
        />
      </div>

      {searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No students found for "{query}"</p>
      )}

      <div className="space-y-3">
        {results.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.roll_number} • Contact: {s.parent_contact || "N/A"}</p>
                </div>
                <div className="text-right text-xs">
                  <p className={s.att.percentage < 75 ? "text-destructive font-bold" : ""}>
                    Att: {s.att.percentage}%
                  </p>
                  <p>Marks: {s.totalMarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
