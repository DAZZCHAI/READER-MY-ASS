// ─── Geometry (matching react-pdf-highlighter-extended internals) ─────────────

export interface BoundingRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  pageNumber?: number;
}

export interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  pageNumber?: number;
}

export interface HighlightPosition {
  boundingRect: BoundingRect;
  rects: Rect[];
  pageNumber: number;
}

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface ColorSlot {
  id: string;
  pdfId: string;
  slotNumber: 1 | 2 | 3;
  color: string;
  label: string;
}

export interface Highlight {
  id: string;
  pdfId: string;
  colorSlot: 1 | 2 | 3;
  text: string;
  position: HighlightPosition;
  createdAt: string;
}

export interface Comment {
  id: string;
  pdfId: string;
  selectedText: string;
  commentText: string;
  position: HighlightPosition;
  createdAt: string;
  updatedAt: string;
}

export interface PdfMeta {
  id: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    highlights: number;
    comments: number;
  };
}

// ─── Dictionary API ───────────────────────────────────────────────────────────

export interface DictionaryPhonetic {
  text?: string;
  audio?: string;
}

export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: DictionaryPhonetic[];
  meanings: DictionaryMeaning[];
  sourceUrls?: string[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type SidebarTab = "annotations" | "search" | "dictionary";

export interface NewHighlightPayload {
  text: string;
  position: HighlightPosition;
  colorSlot: 1 | 2 | 3;
}

export interface NewCommentPayload {
  selectedText: string;
  commentText: string;
  position: HighlightPosition;
}
