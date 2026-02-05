interface GaugeProps {
  yesCount: number;
  noCount: number;
  size?: number;
}

export function Gauge({ yesCount, noCount, size = 160 }: GaugeProps) {
  const total = yesCount + noCount;
  const yesPercent = total > 0 ? (yesCount / total) * 100 : 50;
  const noPercent = total > 0 ? 100 - yesPercent : 50;
  const yesMajority = yesPercent >= noPercent;
  const majorityPercent = Math.round(yesMajority ? yesPercent : noPercent);
  const majorityLabel = yesMajority ? "Yes" : "No";

  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const yesArc = (yesPercent / 100) * circumference;
  const noArc = circumference - yesArc;

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-2">
        {/* Yes count label - left of gauge */}
        <div className="text-green-600 font-semibold text-sm pb-1">
          {yesCount}
        </div>

        <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
          {/* Background track */}
          <path
            d={`M ${strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${centerY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />

          {/* Yes segment (green) - starts from left */}
          {yesArc > 0 && (
            <path
              d={`M ${strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${centerY}`}
              fill="none"
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${yesArc} ${circumference}`}
              strokeLinecap="butt"
            />
          )}

          {/* No segment (red) - starts from right */}
          {noArc > 0 && (
            <path
              d={`M ${size - strokeWidth / 2} ${centerY} A ${radius} ${radius} 0 0 0 ${strokeWidth / 2} ${centerY}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${noArc} ${circumference}`}
              strokeLinecap="butt"
            />
          )}
        </svg>

        {/* No count label - right of gauge */}
        <div className="text-red-500 font-semibold text-sm pb-1">
          {noCount}
        </div>
      </div>

      {/* Majority percentage below gauge */}
      <div className="text-center">
        <span
          className={`text-xl font-bold ${yesMajority ? "text-green-600" : "text-red-500"}`}
        >
          {majorityPercent}% {majorityLabel}
        </span>
      </div>
    </div>
  );
}
