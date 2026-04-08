"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import type { PdfMeta } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded: (pdf: PdfMeta) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export function UploadModal({ open, onClose, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = useCallback((f: File) => {
    setError("");
    setState("idle");
    if (f.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    if (f.size > MAX_SIZE) {
      setError(`El archivo supera el límite de 50 MB (${formatBytes(f.size)}).`);
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    setProgress(0);

    try {
      // 1. Request presigned URL + create DB record
      const metaRes = await fetch("/api/pdfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          contentType: "application/pdf",
        }),
      });

      if (!metaRes.ok) throw new Error("Error al crear el registro");
      const { pdf, uploadUrl } = await metaRes.json();

      // 2. Upload directly to S3/R2 via presigned URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      setState("success");
      setTimeout(() => {
        onUploaded(pdf);
        resetState();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setState("error");
    }
  };

  const resetState = () => {
    setFile(null);
    setState("idle");
    setProgress(0);
    setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Subir PDF</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
            dragOver
              ? "border-primary bg-primary/5"
              : file
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-green-500" />
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-sm">Arrastra un PDF o haz click</p>
              <p className="text-xs text-muted-foreground">Máximo 50 MB</p>
            </div>
          )}
        </div>

        {/* Progress */}
        {state === "uploading" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Subiendo...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status messages */}
        {state === "success" && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-4">
            <CheckCircle2 className="h-4 w-4" />
            PDF subido correctamente
          </div>
        )}
        {(state === "error" || error) && (
          <div className="flex items-center gap-2 text-destructive text-sm mb-4">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { resetState(); onClose(); }}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!file || state === "uploading" || state === "success" || !!error}
            onClick={handleUpload}
          >
            {state === "uploading" ? "Subiendo..." : "Subir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
