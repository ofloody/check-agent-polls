import { PollCard } from "./PollCard";
import type { AggregatedPollData } from "@/types/poll";

interface PollSetRowProps {
  data: AggregatedPollData;
}

export function PollSetRow({ data }: PollSetRowProps) {
  const createdDate = new Date(data.set.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
        <span className="text-xs text-muted-foreground">{createdDate}</span>
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
