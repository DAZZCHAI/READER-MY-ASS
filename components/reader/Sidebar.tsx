"use client";

import { Highlighter, Search, BookOpen } from "lucide-react";
import { useReaderStore } from "@/store/readerStore";
import { ColorSlots } from "./ColorSlots";
import { HighlightList } from "./HighlightList";
import { CommentList } from "./CommentList";
import { SearchPanel } from "./SearchPanel";
import { DictionaryPanel } from "./DictionaryPanel";
import { cn } from "@/lib/utils";
import type { SidebarTab } from "@/types";

interface Props {
  pdfId: string;
}

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: "annotations", label: "Notas", icon: <Highlighter className="h-3.5 w-3.5" /> },
  { id: "search", label: "Buscar", icon: <Search className="h-3.5 w-3.5" /> },
  { id: "dictionary", label: "Diccionario", icon: <BookOpen className="h-3.5 w-3.5" /> },
];

export function Sidebar({ pdfId }: Props) {
  const { activeTab, setActiveTab } = useReaderStore();

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto sidebar-scroll">
        {activeTab === "annotations" && <AnnotationsPanel pdfId={pdfId} />}
        {activeTab === "search" && <SearchPanel />}
        {activeTab === "dictionary" && <DictionaryPanel />}
      </div>
    </div>
  );
}

function AnnotationsPanel({ pdfId }: { pdfId: string }) {
  return (
    <div className="flex flex-col">
      <ColorSlots pdfId={pdfId} />
      <div className="h-px bg-border" />
      <HighlightList />
      <div className="h-px bg-border" />
      <CommentList />
    </div>
  );
}
