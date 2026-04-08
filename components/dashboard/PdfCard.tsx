"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, FileText, Highlighter, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import type { PdfMeta } from "@/types";

interface Props {
  pdf: PdfMeta;
  onDeleted: (id: string) => void;
}

export function PdfCard({ pdf, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${pdf.title}"? Esta acción no se puede deshacer.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/pdfs/${pdf.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      onDeleted(pdf.id);
      toast({ title: "PDF eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <div className="group border border-border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
      {/* Thumbnail area */}
      <div className="h-36 bg-muted/50 flex items-center justify-center border-b border-border">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={pdf.title}>
          {pdf.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {formatDate(pdf.createdAt)} · {formatBytes(pdf.fileSize)}
          {pdf.pageCount && ` · ${pdf.pageCount} págs.`}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Highlighter className="h-3 w-3" />
            {pdf._count?.highlights ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {pdf._count?.comments ?? 0}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1 gap-1.5" asChild>
            <Link href={`/reader/${pdf.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
