"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  PdfLoader,
  PdfHighlighter,
  Highlight,
  Popup,
  AreaHighlight,
} from "react-pdf-highlighter-extended";
import type {
  IHighlight,
  NewHighlight,
  ScaledPosition,
  Content,
} from "react-pdf-highlighter-extended";
import { useReaderStore } from "@/store/readerStore";
import { SelectionTooltip } from "./SelectionTooltip";
import { useHighlights } from "@/hooks/useHighlights";
import type { HighlightPosition } from "@/types";

// Spinner shown while the PDF loads
function PdfSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando PDF…</p>
      </div>
    </div>
  );
}

// Maps our domain Highlight → IHighlight expected by the library
function toLibHighlight(h: {
  id: string;
  text: string;
  position: HighlightPosition;
  colorSlot: 1 | 2 | 3;
  color: string; // resolved hex from colorSlots
}): IHighlight {
  return {
    id: h.id,
    content: { text: h.text },
    position: {
      boundingRect: { ...h.position.boundingRect, pageNumber: h.position.pageNumber },
      rects: h.position.rects.map((r) => ({ ...r, pageNumber: h.position.pageNumber })),
      pageNumber: h.position.pageNumber,
    },
    comment: {
      text: "",
      emoji: "",
    },
  };
}

export function PdfReader() {
  const {
    pdfUrl,
    highlights,
    comments,
    colorSlots,
    activeColorSlot,
    setScrollToHighlight,
    openCommentModal,
    setDictionaryQuery,
    setActiveTab,
  } = useReaderStore();

  const { saveHighlight } = useHighlights();

  // scrollTo ref provided by the library
  const scrollViewerTo = useRef<(highlight: IHighlight) => void>(() => {});

  // Register the scroll function so sidebar cards can trigger it
  useEffect(() => {
    setScrollToHighlight((id: string) => {
      const h = highlights.find((x) => x.id === id);
      if (!h) return;
      const libH = toLibHighlight({
        ...h,
        color: colorSlots.find((s) => s.slotNumber === h.colorSlot)?.color ?? "#FDE047",
      });
      scrollViewerTo.current(libH);
    });
  }, [highlights, colorSlots, setScrollToHighlight]);

  // Keyboard shortcut: 1/2/3 to switch active color slot
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "1") useReaderStore.getState().setActiveColorSlot(1);
      if (e.key === "2") useReaderStore.getState().setActiveColorSlot(2);
      if (e.key === "3") useReaderStore.getState().setActiveColorSlot(3);
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        useReaderStore.getState().setActiveTab("search");
        setTimeout(() => document.getElementById("pdf-search-input")?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const getHighlightColor = useCallback(
    (colorSlotNum: 1 | 2 | 3) =>
      colorSlots.find((s) => s.slotNumber === colorSlotNum)?.color ?? "#FDE047",
    [colorSlots]
  );

  // Build the combined list of library-compatible highlights (domain highlights + comment markers)
  const libHighlights: IHighlight[] = [
    ...highlights.map((h) =>
      toLibHighlight({ ...h, color: getHighlightColor(h.colorSlot) })
    ),
    ...comments.map((c) => ({
      id: `comment-${c.id}`,
      content: { text: c.selectedText },
      position: {
        boundingRect: { ...c.position.boundingRect, pageNumber: c.position.pageNumber },
        rects: c.position.rects.map((r) => ({ ...r, pageNumber: c.position.pageNumber })),
        pageNumber: c.position.pageNumber,
      },
      comment: { text: c.commentText, emoji: "💬" },
    })),
  ];

  if (!pdfUrl) return null;

  return (
    <PdfLoader url={pdfUrl} beforeLoad={<PdfSpinner />}>
      {(pdfDocument) => (
        <PdfHighlighter
          pdfDocument={pdfDocument}
          enableAreaSelection={(event) => event.altKey}
          highlights={libHighlights}
          scrollRef={(scrollTo) => {
            scrollViewerTo.current = scrollTo;
          }}
          onScrollChange={() => {
            // can be used to update URL hash for deep-linking
          }}
          // ─── Tooltip shown when user finishes a text selection ────────────
          onSelectionFinished={(
            position: ScaledPosition,
            content: Content,
            hideTipAndSelection: () => void,
            transformSelection: () => void
          ) => (
            <SelectionTooltip
              text={content.text ?? ""}
              onHighlight={(slot) => {
                if (!content.text) return;
                saveHighlight({
                  text: content.text,
                  position: position as unknown as HighlightPosition,
                  colorSlot: slot,
                });
                hideTipAndSelection();
              }}
              onComment={() => {
                if (!content.text) return;
                openCommentModal(position as unknown as HighlightPosition, content.text);
                hideTipAndSelection();
              }}
              onDefine={() => {
                const word = (content.text ?? "").trim().split(/\s+/)[0];
                if (!word) return;
                setDictionaryQuery(word);
                setActiveTab("dictionary");
                hideTipAndSelection();
              }}
              activeColorSlot={activeColorSlot}
              colorSlots={colorSlots}
            />
          )}
          // ─── Render each highlight in the PDF ──────────────────────────────
          highlightTransform={(
            highlight,
            index,
            setTip,
            hideTip,
            viewportToScaled,
            screenshot,
            isScrolledTo
          ) => {
            const isComment = highlight.id.startsWith("comment-");
            const domainH = isComment
              ? null
              : highlights.find((h) => h.id === highlight.id);

            const color = domainH
              ? getHighlightColor(domainH.colorSlot)
              : "transparent";

            const isTextHighlight = !highlight.content?.image;

            const component = isTextHighlight ? (
              <Highlight
                isScrolledTo={isScrolledTo}
                position={highlight.position}
                comment={highlight.comment}
                // Pass color via style override
                key={index}
              />
            ) : (
              <AreaHighlight
                isScrolledTo={isScrolledTo}
                highlight={highlight}
                onChange={(boundingRect) => {
                  // area highlights don't need update in this app
                  void boundingRect;
                }}
              />
            );

            // Wrap with color style
            const colored = (
              <div
                style={
                  isComment
                    ? {
                        borderBottom: "2px dashed #6366f1",
                        opacity: 0.8,
                      }
                    : {
                        // The library renders highlights using the position,
                        // we use a CSS variable to drive Tailwind's mix-blend highlight
                        "--highlight-color": color,
                        opacity: 0.6,
                      } as React.CSSProperties
                }
              >
                {component}
              </div>
            );

            return (
              <Popup
                key={index}
                popupContent={
                  isComment ? (
                    <HighlightNote
                      text={highlight.comment?.text ?? ""}
                      selectedText={highlight.content?.text ?? ""}
                    />
                  ) : (
                    <HighlightColorBadge
                      color={color}
                      label={
                        colorSlots.find((s) => s.slotNumber === domainH?.colorSlot)?.label ?? ""
                      }
                    />
                  )
                }
                onMouseOver={(popupContent) =>
                  setTip(highlight, () => popupContent)
                }
                onMouseOut={hideTip}
                children={colored}
              />
            );
          }}
        />
      )}
    </PdfLoader>
  );
}

// ─── Small popup components shown on hover ────────────────────────────────────

function HighlightColorBadge({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-popover border border-border rounded-lg px-3 py-1.5 shadow-lg text-xs">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-popover-foreground font-medium">{label}</span>
    </div>
  );
}

function HighlightNote({
  text,
  selectedText,
}: {
  text: string;
  selectedText: string;
}) {
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg max-w-xs text-xs">
      <p className="text-muted-foreground italic mb-1 truncate">"{selectedText}"</p>
      <p className="text-popover-foreground">{text}</p>
    </div>
  );
}
