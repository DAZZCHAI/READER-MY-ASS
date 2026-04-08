"use client";

import { useState, useCallback, useRef } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// react-pdf-highlighter-extended exposes a findController on the underlying
// PDF.js viewer. We interact with it via a custom event on the container.
// This panel manages UI state; actual scrolling is handled by the PdfReader
// through the window event "readmark:search".

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [currentResult, setCurrentResult] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const dispatchSearch = useCallback(
    (q: string, direction: "next" | "prev" | "new" = "new") => {
      window.dispatchEvent(
        new CustomEvent("readmark:search", {
          detail: { query: q, direction },
        })
      );
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    setCurrentResult(0);
    setResultCount(null);
    if (q.trim()) {
      dispatchSearch(q);
    } else {
      dispatchSearch(""); // clear highlights
    }
  };

  const handleNext = () => {
    dispatchSearch(query, "next");
    setCurrentResult((n) => n + 1);
  };

  const handlePrev = () => {
    dispatchSearch(query, "prev");
    setCurrentResult((n) => Math.max(0, n - 1));
  };

  const handleClear = () => {
    setQuery("");
    setResultCount(null);
    setCurrentResult(0);
    dispatchSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
        Buscar en el PDF
      </p>

      {/* Input */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          id="pdf-search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Buscar texto…"
          className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "Enter") e.shiftKey ? handlePrev() : handleNext();
            if (e.key === "Escape") handleClear();
          }}
        />
        {query && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      {query && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {resultCount !== null
              ? `${currentResult + 1} de ${resultCount} resultados`
              : "Buscando…"}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrev} title="Anterior (Shift+Enter)">
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNext} title="Siguiente (Enter)">
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {!query && (
        <p className="text-xs text-muted-foreground px-1">
          <kbd className="bg-muted rounded px-1">Ctrl+F</kbd> desde el lector para buscar rápido
        </p>
      )}
    </div>
  );
}
