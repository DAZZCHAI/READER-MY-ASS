"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { BookMarked, LogOut, Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { PdfCard } from "./PdfCard";
import { UploadModal } from "./UploadModal";
import type { PdfMeta } from "@/types";

interface Props {
  user: { name: string; email: string };
  initialPdfs: PdfMeta[];
}

export function DashboardClient({ user, initialPdfs }: Props) {
  const [pdfs, setPdfs] = useState<PdfMeta[]>(initialPdfs);
  const [uploadOpen, setUploadOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleUploaded = (newPdf: PdfMeta) => {
    setPdfs((prev) => [newPdf, ...prev]);
    setUploadOpen(false);
  };

  const handleDeleted = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <BookMarked className="h-5 w-5 text-primary" />
          ReadMark
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user.name || user.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Mis PDFs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pdfs.length} {pdfs.length === 1 ? "documento" : "documentos"}
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Subir PDF
          </Button>
        </div>

        {pdfs.length === 0 ? (
          <EmptyState onUpload={() => setUploadOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pdfs.map((pdf) => (
              <PdfCard key={pdf.id} pdf={pdf} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </main>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={handleUploaded}
      />
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <BookMarked className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Sin PDFs todavía</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Sube tu primer PDF para empezar a leer activamente con resaltados y notas.
      </p>
      <Button onClick={onUpload} className="gap-2">
        <Upload className="h-4 w-4" />
        Subir mi primer PDF
      </Button>
    </div>
  );
}
