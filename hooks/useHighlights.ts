import { useReaderStore } from "@/store/readerStore";
import { useToast } from "@/hooks/useToast";
import type { NewHighlightPayload, Highlight } from "@/types";

export function useHighlights() {
  const { pdfId, addHighlight, removeHighlight } = useReaderStore();
  const { toast } = useToast();

  const saveHighlight = async (payload: NewHighlightPayload): Promise<Highlight | null> => {
    if (!pdfId) return null;

    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId, ...payload }),
      });

      if (!res.ok) throw new Error("Error al guardar el resaltado");

      const highlight: Highlight = await res.json();
      addHighlight(highlight);
      return highlight;
    } catch {
      toast({ title: "No se pudo guardar el resaltado", variant: "destructive" });
      return null;
    }
  };

  const deleteHighlight = async (id: string) => {
    // Optimistic update
    removeHighlight(id);

    try {
      const res = await fetch(`/api/highlights?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
    } catch {
      toast({ title: "No se pudo eliminar el resaltado", variant: "destructive" });
    }
  };

  return { saveHighlight, deleteHighlight };
}
