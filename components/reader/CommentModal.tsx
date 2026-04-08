"use client";

import { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReaderStore } from "@/store/readerStore";
import { useComments } from "@/hooks/useComments";
import { truncate } from "@/lib/utils";

interface Props {
  pdfId: string;
}

export function CommentModal({ pdfId }: Props) {
  const { pendingCommentPosition, pendingCommentText, closeCommentModal } = useReaderStore();
  const { saveComment } = useComments(pdfId);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!pendingCommentPosition || pendingCommentText === null) return null;

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await saveComment({
      selectedText: pendingCommentText,
      commentText: text.trim(),
      position: pendingCommentPosition,
    });
    setSaving(false);
    setText("");
    closeCommentModal();
  };

  const handleClose = () => {
    setText("");
    closeCommentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md mx-4 p-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Agregar comentario</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" onClick={handleClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selected text reference */}
        <div className="bg-muted/60 rounded-lg px-3 py-2 mb-4 border-l-2 border-primary/40">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{truncate(pendingCommentText, 180)}"
          </p>
        </div>

        {/* Comment textarea */}
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu comentario aquí…"
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
            if (e.key === "Escape") handleClose();
          }}
        />

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!text.trim() || saving}
          >
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-right">
          Ctrl+Enter para guardar · Esc para cancelar
        </p>
      </div>
    </div>
  );
}
