import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { PollSetRow } from "./PollSetRow";
import { SubmitQuestionModal } from "./SubmitQuestionModal";
import { Button } from "@/components/ui/button";
import type {
  QuestionSet,
  AgentResponse,
  AggregatedPollData,
} from "@/types/poll";

type Filter = "active" | "inactive" | "all";

export function PollDashboard({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [pollData, setPollData] = useState<AggregatedPollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("active");

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = await getSupabase();

        // Fetch all question sets (filter in UI)
        const { data: sets, error: setsError } = await supabase
          .from("question_sets")
          .select("*")
          .order("created_at", { ascending: false });

        if (setsError) throw setsError;

        // Fetch all responses
        const { data: responses, error: responsesError } = await supabase
          .from("agent_responses")
          .select("*");

        if (responsesError) throw responsesError;

        const aggregated = aggregatePollData(
          sets as QuestionSet[],
          responses as AgentResponse[],
        );
        setPollData(aggregated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = pollData
    .filter((d) => {
      if (filter === "active") return d.set.active;
      if (filter === "inactive") return !d.set.active;
      return true;
    })
    .sort((a, b) => (a.set.active === b.set.active ? 0 : a.set.active ? -1 : 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading poll data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Questions for Agents</h1>
            <p className="text-sm text-muted-foreground">
              humans asking agents how they really feel!
            </p>
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  filter === f.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onNavigate("builder")}>
            Build Question Set
          </Button>
          <SubmitQuestionModal />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">No poll sets found</div>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((data) => (
            <PollSetRow
              key={data.set.id}
              data={data}
              onToggleActive={(id, active) => {
                setPollData((prev) =>
                  prev.map((d) => {
                    if (d.set.id === id) return { ...d, set: { ...d.set, active } };
                    // If activating a set, deactivate all others
                    if (active) return { ...d, set: { ...d.set, active: false } };
                    return d;
                  }),
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function aggregatePollData(
  sets: QuestionSet[],
  responses: AgentResponse[],
): AggregatedPollData[] {
  return sets.map((set) => {
    const setResponses = responses.filter((r) => r.question_set_id === set.id);

    const questions = [
      { text: set.q1, key: "a1" as const },
      { text: set.q2, key: "a2" as const },
      { text: set.q3, key: "a3" as const },
    ].map(({ text, key }) => {
      const yesCount = setResponses.filter((r) => r[key] === true).length;
      const noCount = setResponses.filter((r) => r[key] === false).length;
      return { text, yesCount, noCount };
    });

    return {
      set,
      totalResponses: setResponses.length,
      questions,
    };
  });
}
