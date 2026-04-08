"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, Volume2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/store/readerStore";
import { useDictionary } from "@/hooks/useDictionary";

export function DictionaryPanel() {
  const { dictionaryQuery, setDictionaryQuery } = useReaderStore();
  const [inputValue, setInputValue] = useState(dictionaryQuery);
  const { entry, loading, error, lookup } = useDictionary();

  // Trigger lookup when query changes from the store (e.g. via "Definir" in tooltip)
  useEffect(() => {
    if (dictionaryQuery) {
      setInputValue(dictionaryQuery);
      lookup(dictionaryQuery);
    }
  }, [dictionaryQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const word = inputValue.trim();
    if (!word) return;
    setDictionaryQuery(word);
    lookup(word);
  };

  const playAudio = (url: string) => {
    new Audio(url).play().catch(() => {});
  };

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
        Diccionario
      </p>

      {/* Search input */}
      <div className="relative mb-3">
        <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Buscar palabra en inglés…"
          className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        {inputValue && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => { setInputValue(""); setDictionaryQuery(""); }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Button size="sm" className="w-full gap-1.5 mb-4" onClick={handleSearch} disabled={loading}>
        {loading ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando…</>
        ) : (
          <><Search className="h-3.5 w-3.5" /> Buscar</>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {/* Result */}
      {entry && !loading && (
        <div className="animate-fade-in">
          {/* Word + phonetic */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-lg font-bold leading-tight">{entry.word}</h3>
              {entry.phonetic && (
                <p className="text-xs text-muted-foreground">{entry.phonetic}</p>
              )}
            </div>
            {/* Audio button */}
            {entry.phonetics.some((p) => p.audio) && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => {
                  const audio = entry.phonetics.find((p) => p.audio)?.audio;
                  if (audio) playAudio(audio);
                }}
                title="Pronunciar"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Meanings */}
          <div className="flex flex-col gap-4">
            {entry.meanings.map((meaning, mi) => (
              <div key={mi}>
                <p className="text-xs font-semibold text-primary italic mb-1.5">
                  {meaning.partOfSpeech}
                </p>
                <ol className="flex flex-col gap-2">
                  {meaning.definitions.slice(0, 3).map((def, di) => (
                    <li key={di} className="flex gap-2">
                      <span className="text-xs font-medium text-muted-foreground flex-shrink-0 w-4">
                        {di + 1}.
                      </span>
                      <div>
                        <p className="text-xs leading-relaxed">{def.definition}</p>
                        {def.example && (
                          <p className="text-xs text-muted-foreground italic mt-0.5">
                            "{def.example}"
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Synonyms */}
                {meaning.synonyms.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Sinónimos: </span>
                    <span className="text-xs">
                      {meaning.synonyms.slice(0, 5).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Source */}
          <p className="text-xs text-muted-foreground mt-4">
            Fuente: Free Dictionary API
          </p>
        </div>
      )}

      {!entry && !loading && !error && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Solo inglés — escribe una palabra y presiona buscar
        </p>
      )}
    </div>
  );
}
