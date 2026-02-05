import { Gauge } from "./Gauge";
import type { QuestionData } from "@/types/poll";

interface PollCardProps {
  questionNumber: number;
  data: QuestionData;
}

export function PollCard({ questionNumber, data }: PollCardProps) {
  return (
    <div className="rounded-lg bg-muted/50 p-4 flex flex-col items-center gap-3 min-h-[260px]">
      <div className="w-full space-y-1.5">
        <p className="text-lg font-bold leading-snug min-h-[52px]">
          {data.text}
        </p>
        <p className="text-xs text-muted-foreground/60">
          Question {questionNumber}
        </p>
      </div>
      <Gauge yesCount={data.yesCount} noCount={data.noCount} />
    </div>
  );
}
