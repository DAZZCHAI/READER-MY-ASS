"use client";

import { useEffect } from "react";
import { useReaderStore } from "@/store/readerStore";
import { PdfReader } from "./PdfReader";
import { ReaderHeader } from "./ReaderHeader";
import { Sidebar } from "./Sidebar";
import { CommentModal } from "./CommentModal";
import type { Highlight, Comment, ColorSlot } from "@/types";

interface PdfData {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number | null;
  highlights: Highlight[];
  comments: Comment[];
  colorSlots: ColorSlot[];
}

interface Props {
  pdf: PdfData;
}

export function PdfReaderPage({ pdf }: Props) {
  const { init, setHighlights, setComments, setColorSlots, sidebarOpen } = useReaderStore();

  useEffect(() => {
    init(pdf.id, pdf.fileUrl);
    setHighlights(pdf.highlights);
    setComments(pdf.comments);
    setColorSlots(pdf.colorSlots);
  }, [pdf.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ReaderHeader title={pdf.title} />

      <div className="flex flex-1 overflow-hidden">
        {/* PDF viewer area */}
        <div className="flex-1 relative overflow-hidden">
          <PdfReader />
        </div>

        {/* Collapsible sidebar */}
        {sidebarOpen && (
          <aside className="w-80 border-l border-border flex-shrink-0 flex flex-col overflow-hidden">
            <Sidebar pdfId={pdf.id} />
          </aside>
        )}
      </div>

      <CommentModal pdfId={pdf.id} />
    </div>
  );
}
