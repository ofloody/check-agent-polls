import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { PollCard } from "./PollCard";
import { Button } from "@/components/ui/button";
import type { AggregatedPollData } from "@/types/poll";

interface PollSetRowProps {
  data: AggregatedPollData;
  onToggleActive?: (id: string, active: boolean) => void;
}

export function PollSetRow({ data, onToggleActive }: PollSetRowProps) {
  const [toggling, setToggling] = useState(false);

  const createdDate = new Date(data.set.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleToggle() {
    setToggling(true);
    try {
      const supabase = await getSupabase();
      const newActive = !data.set.active;
      const { error } = await supabase
        .from("question_sets")
        .update({ active: newActive })
        .eq("id", data.set.id);

      if (error) throw error;
      onToggleActive?.(data.set.id, newActive);
    } catch (err) {
      console.error("Failed to toggle active status:", err);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{data.set.id}</h2>
          {data.set.name && (
            <span className="text-sm text-muted-foreground">{data.set.name}</span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {data.totalResponses} responses
          </span>
          {!data.set.active && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling ? "..." : data.set.active ? "Deactivate" : "Activate"}
          </Button>
          <span className="text-xs text-muted-foreground">{createdDate}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {data.questions.map((question, index) => (
          <PollCard
            key={index}
            questionNumber={index + 1}
            data={question}
          />
        ))}
      </div>
    </div>
  );
}
