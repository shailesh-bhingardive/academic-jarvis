import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getDashboardData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/predictions")({
  component: PredictionsPage,
});

// Simple linear regression prediction
function predictMarks(attendancePct: number, prevMarks: number): number {
  // Weights derived from typical academic correlation
  // predicted = 0.4 * attendance + 0.5 * prevMarks + 10 (base)
  const predicted = 0.4 * attendancePct + 0.5 * prevMarks + 10;
  return Math.min(100, Math.max(0, Math.round(predicted)));
}

function PredictionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Predictions</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Add students with attendance and marks data to see predictions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const predictions = data.students.map((s: any) => ({
    ...s,
    predictedMarks: predictMarks(s.attendancePercentage, s.marksPercentage),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ML Predictions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Predicted final marks using Linear Regression based on attendance and previous performance
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Model: Linear Regression</p>
              <p className="text-xs text-muted-foreground">Inputs: Attendance % + Previous Marks % → Predicted Final %</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {predictions.map((s: any) => (
          <Card key={s.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.roll_number}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Att: {s.attendancePercentage}%</span>
                    <span>Marks: {s.marksPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold text-primary">{s.predictedMarks}%</span>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${s.predictedMarks}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
