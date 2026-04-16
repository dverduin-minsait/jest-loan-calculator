interface LegendItem {
  key: string;
  label: string;
  color: string;
  dashed: boolean;
}

interface ChartLegendProps {
  items: LegendItem[];
}

function LineSwatch({ color, dashed }: { color: string; dashed: boolean }) {
  return (
    <svg width="20" height="10" aria-hidden="true" className="shrink-0">
      <line
        x1="0" y1="5" x2="20" y2="5"
        stroke={color}
        strokeWidth={dashed ? 1.5 : 2}
        strokeDasharray={dashed ? "4 2" : undefined}
        strokeOpacity={dashed ? 0.8 : 1}
      />
    </svg>
  );
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div
      className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 px-1"
      role="list"
      aria-label="Chart legend"
    >
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-1.5 min-w-0 text-xs text-gray-600"
          role="listitem"
        >
          <LineSwatch color={item.color} dashed={item.dashed} />
          <span className="truncate max-w-[140px] sm:max-w-none">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export type { LegendItem };
