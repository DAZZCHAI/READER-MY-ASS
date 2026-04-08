"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { useReaderStore } from "@/store/readerStore";
import { cn } from "@/lib/utils";

interface Props {
  pdfId: string;
}

export function ColorSlots({ pdfId }: Props) {
  const { colorSlots, activeColorSlot, setActiveColorSlot, updateColorSlot } = useReaderStore();

  const handleColorChange = async (slotNumber: 1 | 2 | 3, color: string) => {
    updateColorSlot(slotNumber, { color });
    // Persist to server
    await fetch(`/api/color-slots/${pdfId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotNumber, color }),
    });
  };

  const handleLabelChange = async (slotNumber: 1 | 2 | 3, label: string) => {
    updateColorSlot(slotNumber, { label });
    // Debounce could be added here; for now save on blur via onBlur below
  };

  const handleLabelBlur = async (slotNumber: 1 | 2 | 3, label: string) => {
    await fetch(`/api/color-slots/${pdfId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotNumber, label }),
    });
  };

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
        Colores
      </p>
      <div className="flex flex-col gap-2">
        {([1, 2, 3] as const).map((slot) => {
          const cs = colorSlots.find((s) => s.slotNumber === slot);
          if (!cs) return null;
          return (
            <ColorSlotRow
              key={slot}
              slot={slot}
              color={cs.color}
              label={cs.label}
              isActive={activeColorSlot === slot}
              onActivate={() => setActiveColorSlot(slot)}
              onColorChange={(c) => handleColorChange(slot, c)}
              onLabelChange={(l) => handleLabelChange(slot, l)}
              onLabelBlur={(l) => handleLabelBlur(slot, l)}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2 px-1">
        Teclas <kbd className="bg-muted rounded px-1">1</kbd>{" "}
        <kbd className="bg-muted rounded px-1">2</kbd>{" "}
        <kbd className="bg-muted rounded px-1">3</kbd> para activar
      </p>
    </div>
  );
}

interface RowProps {
  slot: 1 | 2 | 3;
  color: string;
  label: string;
  isActive: boolean;
  onActivate: () => void;
  onColorChange: (color: string) => void;
  onLabelChange: (label: string) => void;
  onLabelBlur: (label: string) => void;
}

function ColorSlotRow({
  slot,
  color,
  label,
  isActive,
  onActivate,
  onColorChange,
  onLabelChange,
  onLabelBlur,
}: RowProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
      onClick={onActivate}
    >
      {/* Active indicator */}
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
      </span>

      {/* Slot number badge */}
      <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">{slot}</span>

      {/* Color swatch — click opens native color picker */}
      <button
        className="w-6 h-6 rounded-full border-2 border-white/70 dark:border-black/20 shadow-sm flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ background: color }}
        onClick={(e) => {
          e.stopPropagation();
          colorInputRef.current?.click();
        }}
        title="Cambiar color"
      />
      {/* Hidden native color input */}
      <input
        ref={colorInputRef}
        type="color"
        value={color}
        className="sr-only"
        onChange={(e) => onColorChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Label input */}
      <input
        type="text"
        value={label}
        maxLength={30}
        placeholder="Sin nombre"
        className="flex-1 bg-transparent text-sm focus:outline-none focus:bg-background focus:rounded px-1 min-w-0"
        onChange={(e) => onLabelChange(e.target.value)}
        onBlur={(e) => onLabelBlur(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
      />
    </div>
  );
}
