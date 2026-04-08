import { useState } from "react";
import type { DictionaryEntry } from "@/types";

export function useDictionary() {
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;

    setLoading(true);
    setError("");
    setEntry(null);

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`
      );

      if (res.status === 404) {
        setError(`No se encontró la palabra "${clean}". El diccionario es solo en inglés.`);
        return;
      }

      if (!res.ok) throw new Error("Error al consultar el diccionario");

      const data: DictionaryEntry[] = await res.json();
      if (data.length > 0) {
        setEntry(data[0]);
      } else {
        setError("Sin resultados.");
      }
    } catch {
      setError("No se pudo conectar al diccionario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return { entry, loading, error, lookup };
}
