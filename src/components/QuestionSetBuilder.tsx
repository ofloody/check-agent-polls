import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { SubmittedQuestion } from "@/types/poll";

export function QuestionSetBuilder({ onNavigate }: { onNavigate: () => void }) {
  const [questions, setQuestions] = useState<SubmittedQuestion[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [setName, setSetName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const supabase = await getSupabase();
        const { data, error: fetchError } = await supabase
          .from("submitted_questions")
          .select("*")
          .eq("selected", false)
          .order("submitted_at", { ascending: false });

        if (fetchError) throw fetchError;
        setQuestions(data as SubmittedQuestion[]);
      } catch {
        // If table doesn't exist or fetch fails, just show empty state
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  function toggleSelection(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function handleSave() {
    if (selected.length !== 3 || !setName.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const supabase = await getSupabase();
      const selectedQuestions = selected.map(
        (id) => questions.find((q) => q.id === id)!
      );

      // Generate ID like "1feb2026"
      const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
      const now = new Date();
      const monthYear = months[now.getMonth()] + now.getFullYear();

      const { data: existing } = await supabase
        .from("question_sets")
        .select("id")
        .like("id", `%${monthYear}`);

      const setNumber = (existing?.length ?? 0) + 1;
      const setId = `${setNumber}${monthYear}`;

      const { data: newSet, error: insertError } = await supabase
        .from("question_sets")
        .insert({
          id: setId,
          name: setName.trim(),
          q1: selectedQuestions[0].question,
          q2: selectedQuestions[1].question,
          q3: selectedQuestions[2].question,
          active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("submitted_questions")
        .update({ selected: true, question_set_id: newSet.id })
        .in("id", selected);

      if (updateError) throw updateError;

      onNavigate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question set");
    } finally {
      setSaving(false);
    }
  }

  const selectedQuestions = selected.map((id) => questions.find((q) => q.id === id)!);
  const canSave = selected.length === 3 && setName.trim().length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading submitted questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onNavigate}>
          &larr; Back
        </Button>
        <h1 className="text-3xl font-bold">Build a Question Set</h1>
      </div>

      {/* Set name */}
      <div className="space-y-2 max-w-md">
        <Label htmlFor="set-name">Set Name</Label>
        <Input
          id="set-name"
          placeholder="e.g. Week 3 Questions"
          value={setName}
          onChange={(e) => setSetName(e.target.value)}
        />
      </div>

      {/* Selection counter */}
      <p className={`text-sm font-medium ${selected.length === 3 ? "text-green-600" : "text-muted-foreground"}`}>
        {selected.length} of 3 selected
      </p>

      {/* Selected preview slots */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} className={selectedQuestions[i] ? "border-primary" : "border-dashed"}>
            <CardContent className="text-sm">
              <span className="font-semibold text-muted-foreground">Q{i + 1}</span>
              {selectedQuestions[i] ? (
                <p className="mt-1">{selectedQuestions[i].question}</p>
              ) : (
                <p className="mt-1 text-muted-foreground italic">Select a question</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No unassigned questions available.
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => {
            const isSelected = selected.includes(q.id);
            const isDisabled = !isSelected && selected.length >= 3;

            return (
              <Card
                key={q.id}
                onClick={() => !isDisabled && toggleSelection(q.id)}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-foreground/20"
                }`}
              >
                <CardContent className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by {q.name} (@{q.github_username})
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-primary font-bold text-lg shrink-0">&#10003;</span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Save button */}
      <Button onClick={handleSave} disabled={!canSave || saving} className="w-full max-w-md">
        {saving ? "Saving..." : "Save Question Set"}
      </Button>
    </div>
  );
}
