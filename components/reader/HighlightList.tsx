"use client";

import { Highlighter, Trash2, ChevronRight } from "lucide-react";
import { useReaderStore } from "@/store/readerStore";
import { useHighlights } from "@/hooks/useHighlights";
import { truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function HighlightList() {
  const { highlights, colorSlots, scrollToHighlight } = useReaderStore();
  const { deleteHighlight } = useHighlights();

  if (highlights.length === 0) {
    return (
      <div className="px-4 py-5 text-center">
        <Highlighter className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">
          Selecciona texto y elige un color para resaltar
        </p>
      </div>
    );
  }

  // Group by colorSlot
  const grouped = ([1, 2, 3] as const)
    .map((slot) => ({
      slot,
      colorSlot: colorSlots.find((cs) => cs.slotNumber === slot),
      items: highlights.filter((h) => h.colorSlot === slot),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
        Resaltados · {highlights.length}
      </p>
      <div className="flex flex-col gap-3">
        {grouped.map(({ slot, colorSlot, items }) => (
          <div key={slot}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-1.5 px-1">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: colorSlot?.color ?? "#ccc" }}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {colorSlot?.label ?? `Color ${slot}`}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">{items.length}</span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-1">
              {items.map((h) => (
                <HighlightCard
                  key={h.id}
                  text={h.text}
                  color={colorSlot?.color ?? "#ccc"}
                  onNavigate={() => scrollToHighlight?.(h.id)}
                  onDelete={() => deleteHighlight(h.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  text: string;
  color: string;
  onNavigate: () => void;
  onDelete: () => void;
}

function HighlightCard({ text, color, onNavigate, onDelete }: CardProps) {
  return (
    <div
      className="group flex items-start gap-1.5 rounded-lg p-2 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onNavigate}
    >
      <span
        className="w-1 flex-shrink-0 rounded-full mt-0.5 self-stretch min-h-[1.5rem]"
        style={{ background: color }}
      />
      <p className="text-xs flex-1 leading-relaxed">{truncate(text, 100)}</p>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          title="Ir al resaltado"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Eliminar resaltado"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
