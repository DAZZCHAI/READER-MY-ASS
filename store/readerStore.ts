import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  Highlight,
  Comment,
  ColorSlot,
  SidebarTab,
  HighlightPosition,
} from "@/types";

// ─── Default color slots ───────────────────────────────────────────────────────

const DEFAULT_SLOTS: Omit<ColorSlot, "id" | "pdfId">[] = [
  { slotNumber: 1, color: "#FDE047", label: "Importante" },   // yellow-300
  { slotNumber: 2, color: "#86EFAC", label: "Definiciones" }, // green-300
  { slotNumber: 3, color: "#F9A8D4", label: "Citas" },        // pink-300
];

// ─── State shape ──────────────────────────────────────────────────────────────

interface ReaderState {
  // PDF metadata
  pdfId: string | null;
  pdfUrl: string | null;

  // Annotations
  highlights: Highlight[];
  comments: Comment[];
  colorSlots: ColorSlot[];

  // UI
  activeColorSlot: 1 | 2 | 3;
  sidebarOpen: boolean;
  activeTab: SidebarTab;
  scrollToHighlight: ((id: string) => void) | null;

  // Pending comment (text selected, awaiting user input)
  pendingCommentPosition: HighlightPosition | null;
  pendingCommentText: string | null;

  // Dictionary
  dictionaryQuery: string;

  // Actions
  init: (pdfId: string, pdfUrl: string) => void;
  setHighlights: (highlights: Highlight[]) => void;
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (id: string) => void;
  setComments: (comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  removeComment: (id: string) => void;
  setColorSlots: (slots: ColorSlot[]) => void;
  updateColorSlot: (slotNumber: 1 | 2 | 3, updates: Partial<Pick<ColorSlot, "color" | "label">>) => void;
  setActiveColorSlot: (slot: 1 | 2 | 3) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: SidebarTab) => void;
  setScrollToHighlight: (fn: (id: string) => void) => void;
  openCommentModal: (position: HighlightPosition, selectedText: string) => void;
  closeCommentModal: () => void;
  setDictionaryQuery: (query: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useReaderStore = create<ReaderState>()(
  immer((set) => ({
    pdfId: null,
    pdfUrl: null,
    highlights: [],
    comments: [],
    colorSlots: [],
    activeColorSlot: 1,
    sidebarOpen: true,
    activeTab: "annotations",
    scrollToHighlight: null,
    pendingCommentPosition: null,
    pendingCommentText: null,
    dictionaryQuery: "",

    init: (pdfId, pdfUrl) =>
      set((state) => {
        state.pdfId = pdfId;
        state.pdfUrl = pdfUrl;
        state.highlights = [];
        state.comments = [];
        state.colorSlots = [];
      }),

    setHighlights: (highlights) =>
      set((state) => { state.highlights = highlights; }),

    addHighlight: (highlight) =>
      set((state) => { state.highlights.unshift(highlight); }),

    removeHighlight: (id) =>
      set((state) => {
        state.highlights = state.highlights.filter((h) => h.id !== id);
      }),

    setComments: (comments) =>
      set((state) => { state.comments = comments; }),

    addComment: (comment) =>
      set((state) => { state.comments.unshift(comment); }),

    removeComment: (id) =>
      set((state) => {
        state.comments = state.comments.filter((c) => c.id !== id);
      }),

    setColorSlots: (slots) =>
      set((state) => { state.colorSlots = slots; }),

    updateColorSlot: (slotNumber, updates) =>
      set((state) => {
        const slot = state.colorSlots.find((s) => s.slotNumber === slotNumber);
        if (slot) Object.assign(slot, updates);
      }),

    setActiveColorSlot: (slot) =>
      set((state) => { state.activeColorSlot = slot; }),

    toggleSidebar: () =>
      set((state) => { state.sidebarOpen = !state.sidebarOpen; }),

    setActiveTab: (tab) =>
      set((state) => { state.activeTab = tab; }),

    setScrollToHighlight: (fn) =>
      set((state) => { state.scrollToHighlight = fn; }),

    openCommentModal: (position, selectedText) =>
      set((state) => {
        state.pendingCommentPosition = position;
        state.pendingCommentText = selectedText;
      }),

    closeCommentModal: () =>
      set((state) => {
        state.pendingCommentPosition = null;
        state.pendingCommentText = null;
      }),

    setDictionaryQuery: (query) =>
      set((state) => { state.dictionaryQuery = query; }),
  }))
);

export { DEFAULT_SLOTS };
