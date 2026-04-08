"use client";

import { useState } from "react";
import { MessageSquare, Trash2, ChevronRight, Pencil, Check, X } from "lucide-react";
import { useReaderStore } from "@/store/readerStore";
import { useComments } from "@/hooks/useComments";
import { truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  pdfId: string;
}

export function CommentList({ pdfId }: Props) {
  const { comments, scrollToHighlight } = useReaderStore();
  const { deleteComment, updateComment } = useComments(pdfId);

  if (comments.length === 0) {
    return (
      <div className="px-4 py-5 text-center">
        <MessageSquare className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">
          Selecciona texto y haz click en "Comentar" para agregar notas
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
        Comentarios · {comments.length}
      </p>
      <div className="flex flex-col gap-2">
        {comments.map((c) => (
          <CommentCard
            key={c.id}
            id={c.id}
            selectedText={c.selectedText}
            commentText={c.commentText}
            onNavigate={() => scrollToHighlight?.(`comment-${c.id}`)}
            onDelete={() => deleteComment(c.id)}
            onUpdate={(text) => updateComment(c.id, text)}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  id: string;
  selectedText: string;
  commentText: string;
  onNavigate: () => void;
  onDelete: () => void;
  onUpdate: (text: string) => void;
}

function CommentCard({
  selectedText,
  commentText,
  onNavigate,
  onDelete,
  onUpdate,
}: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(commentText);

  const handleSave = () => {
    if (draft.trim()) {
      onUpdate(draft.trim());
      setEditing(false);
    }
  };

  return (
    <div
      className="group rounded-lg border border-border bg-background p-2.5 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => !editing && onNavigate()}
    >
      {/* Quote */}
      <p className="text-xs text-muted-foreground italic mb-1.5 border-l-2 border-indigo-400 pl-2">
        "{truncate(selectedText, 60)}"
      </p>

      {/* Comment text / edit mode */}
      {editing ? (
        <div onClick={(e) => e.stopPropagation()}>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full text-xs rounded border border-input bg-background px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-ring mb-1.5"
          />
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => { setDraft(commentText); setEditing(false); }}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
              <Check className="h-3 w-3 text-green-500" />
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs leading-relaxed">{commentText}</p>
      )}

      {/* Actions */}
      {!editing && (
        <div className="flex items-center justify-end gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); onNavigate(); }}
            title="Ir al comentario"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="Editar"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Eliminar"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
