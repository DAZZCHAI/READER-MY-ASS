import { useReaderStore } from "@/store/readerStore";
import { useToast } from "@/hooks/useToast";
import type { NewCommentPayload, Comment } from "@/types";

export function useComments(pdfId: string) {
  const { addComment, removeComment, comments, setComments } = useReaderStore();
  const { toast } = useToast();

  const saveComment = async (payload: NewCommentPayload): Promise<Comment | null> => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId, ...payload }),
      });

      if (!res.ok) throw new Error("Error al guardar el comentario");

      const comment: Comment = await res.json();
      addComment(comment);
      return comment;
    } catch {
      toast({ title: "No se pudo guardar el comentario", variant: "destructive" });
      return null;
    }
  };

  const deleteComment = async (id: string) => {
    removeComment(id);

    try {
      const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
    } catch {
      toast({ title: "No se pudo eliminar el comentario", variant: "destructive" });
    }
  };

  const updateComment = async (id: string, commentText: string) => {
    // Optimistic update
    const updated = comments.map((c) => (c.id === id ? { ...c, commentText } : c));
    setComments(updated);

    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, commentText }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
    } catch {
      toast({ title: "No se pudo actualizar el comentario", variant: "destructive" });
    }
  };

  return { saveComment, deleteComment, updateComment };
}
