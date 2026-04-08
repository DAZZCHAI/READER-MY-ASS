"use client";

import { BookOpen, MessageSquare } from "lucide-react";
import type { ColorSlot } from "@/types";

interface Props {
  text: string;
  activeColorSlot: 1 | 2 | 3;
  colorSlots: ColorSlot[];
  onHighlight: (slot: 1 | 2 | 3) => void;
  onComment: () => void;
  onDefine: () => void;
}

export function SelectionTooltip({
  colorSlots,
  onHighlight,
  onComment,
  onDefine,
}: Props) {
  return (
    <div className="readmark-tooltip flex items-center gap-1 bg-popover border border-border rounded-full px-2 py-1.5 shadow-xl">
      {/* Color buttons */}
      {([1, 2, 3] as const).map((slot) => {
        const cs = colorSlots.find((s) => s.slotNumber === slot);
        if (!cs) return null;
        return (
          <button
            key={slot}
            title={cs.label}
            onClick={() => onHighlight(slot)}
            className="w-7 h-7 rounded-full border-2 border-white/80 dark:border-black/30 shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            style={{ background: cs.color }}
          />
        );
      })}

      {/* Divider */}
      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Comment button */}
      <button
        title="Agregar comentario"
        onClick={onComment}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full hover:bg-accent transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Comentar</span>
      </button>

      {/* Define button */}
      <button
        title="Buscar en diccionario"
        onClick={onDefine}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full hover:bg-accent transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Definir</span>
      </button>
    </div>
  );
}
