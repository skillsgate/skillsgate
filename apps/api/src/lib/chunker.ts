import type { LlmEnrichment, LlmChunk } from "./llm-enrichment";

export interface TextChunk {
  /** Chunk identifier (e.g. "overview", "llm-workflow-1") */
  id: string;
  /** Section heading or "Overview" for the intro */
  title: string;
  /** Chunk text content */
  text: string;
  /** 0-based chunk index in document order */
  index: number;
}

const MIN_CHUNKS = 3;
const MAX_CHUNKS = 6;
const SECTION_CHAR_LIMIT = 1200;

/**
 * Builds structured chunks from SKILL.md content for embedding.
 *
 * Strategy (mirrors scripts/lib/text.ts buildSkillChunks):
 * 1. Chunk 0 ("Overview"): structured metadata — slug, name, description,
 *    LLM summary, categories, capabilities, allowed tools, body highlight.
 * 2. Chunk 1 ("Description"): the skill's description text as its own vector.
 * 3. Chunks 2+: LLM-generated semantic chunks (high quality, diverse coverage).
 * 4. Remaining slots: body split by `## ` headings, then by smart break
 *    points (paragraphs → sentences → words) at SECTION_CHAR_LIMIT.
 * 5. If still below MIN_CHUNKS, pad with body fragments or summary text.
 * 6. Hard cap at MAX_CHUNKS.
 */
export function chunkSkillContent(args: {
  slug: string;
  name: string;
  description: string;
  frontmatter: Record<string, unknown>;
  body: string;
  llm?: LlmEnrichment;
  hasScripts?: boolean;
  hasReferences?: boolean;
}): TextChunk[] {
  const { slug, name, description, frontmatter, body, llm, hasScripts, hasReferences } = args;
  const chunks: TextChunk[] = [];

  // ── Chunk 0: Overview ──────────────────────────────────────────────
  const overviewLines = [
    `Skill Slug: ${slug}`,
    `Name: ${name}`,
    `Description: ${description}`,
  ];
  const tools = Array.isArray(frontmatter["allowed-tools"])
    ? frontmatter["allowed-tools"].join(", ")
    : "";
  if (tools) overviewLines.push(`Allowed Tools: ${tools}`);
  if (llm?.summary) overviewLines.push(`LLM Summary: ${llm.summary}`);
  if (llm?.categories?.length) overviewLines.push(`Categories: ${llm.categories.join(", ")}`);
  if (llm?.capabilities?.length) overviewLines.push(`Capabilities: ${llm.capabilities.join(", ")}`);
  if (hasScripts !== undefined) overviewLines.push(`Has Scripts: ${hasScripts}`);
  if (hasReferences !== undefined) overviewLines.push(`Has References: ${hasReferences}`);
  overviewLines.push(`Highlights:\n${truncate(body, 600)}`);

  chunks.push({
    id: "overview",
    title: "Overview",
    text: overviewLines.join("\n\n"),
    index: 0,
  });

  // ── Chunk 1: Description ────────────────────────────────────────────
  if (description.trim()) {
    chunks.push({
      id: "description",
      title: "Description",
      text: description,
      index: 1,
    });
  }

  // ── LLM-generated chunks (primary) ─────────────────────────────────
  const llmChunks = sanitizeLlmChunks(llm?.chunks ?? []);
  let chunkIndex = chunks.length;
  for (const llmChunk of llmChunks) {
    if (chunks.length >= MAX_CHUNKS) break;
    chunks.push({
      id: `${llmChunk.id}-${chunkIndex}`,
      title: llmChunk.title,
      text: llmChunk.text,
      index: chunkIndex,
    });
    chunkIndex += 1;
  }

  // ── Section-based chunks (fill remaining slots) ────────────────────
  if (chunks.length < MAX_CHUNKS) {
    const sections = splitBodyIntoSections(body);
    for (const section of sections) {
      if (chunks.length >= MAX_CHUNKS) break;
      const pieces = chunkText(section.content, SECTION_CHAR_LIMIT);
      for (const piece of pieces) {
        if (chunks.length >= MAX_CHUNKS) break;
        const title = section.title || `Section ${chunks.length}`;
        chunks.push({
          id: `${slugify(title)}-${chunks.length}`,
          title,
          text: `Section: ${title}\n\n${piece}`,
          index: chunks.length,
        });
      }
    }
  }

  // ── Fallback: raw body splits if still under MIN_CHUNKS ────────────
  if (chunks.length < MIN_CHUNKS) {
    const fallbackPieces = chunkText(body, 900);
    for (const piece of fallbackPieces) {
      if (chunks.length >= MIN_CHUNKS) break;
      const idx = chunks.length;
      chunks.push({
        id: `detail-${idx}`,
        title: `Detail ${idx}`,
        text: `Additional Detail ${idx}\n\n${piece}`,
        index: idx,
      });
    }
  }

  // ── Pad with summary reinforcement if still under MIN_CHUNKS ───────
  while (chunks.length < MIN_CHUNKS) {
    const idx = chunks.length;
    const summaryText = llm?.summary || description || truncate(body, 400) || "Skill summary";
    chunks.push({
      id: `summary-${idx}`,
      title: `Summary ${idx}`,
      text: `Summary reinforcement ${idx}\n\n${summaryText}`,
      index: idx,
    });
  }

  return chunks.slice(0, MAX_CHUNKS);
}

// ── Helpers ─────────────────────────────────────────────────────────────

interface BodySection {
  title: string;
  content: string;
}

function splitBodyIntoSections(body: string): BodySection[] {
  const lines = body.split("\n");
  const sections: BodySection[] = [];
  let currentTitle = "Context";
  let currentLines: string[] = [];

  const pushSection = () => {
    const content = currentLines.join("\n").trim();
    if (content) {
      sections.push({ title: currentTitle, content });
    }
    currentLines = [];
  };

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      pushSection();
      currentTitle = line.replace(/^##\s+/, "").trim() || "Section";
    } else {
      currentLines.push(line);
    }
  }
  pushSection();

  return sections.filter((s) => s.content.length > 0);
}

function chunkText(content: string, maxChars: number): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxChars) return [trimmed];

  const result: string[] = [];
  let remaining = trimmed;
  while (remaining.length > maxChars && result.length < 4) {
    const breakIndex = findBreakIndex(remaining, maxChars);
    result.push(remaining.slice(0, breakIndex).trim());
    remaining = remaining.slice(breakIndex).trim();
  }
  if (remaining) result.push(remaining);
  return result;
}

function findBreakIndex(text: string, maxChars: number): number {
  const slice = text.slice(0, maxChars);
  const paragraphBreak = slice.lastIndexOf("\n\n");
  if (paragraphBreak > maxChars * 0.4) return paragraphBreak;
  const sentenceBreak = slice.lastIndexOf(". ");
  if (sentenceBreak > maxChars * 0.4) return sentenceBreak + 1;
  const wordBreak = slice.lastIndexOf(" ");
  if (wordBreak > maxChars * 0.4) return wordBreak;
  return maxChars;
}

function sanitizeLlmChunks(
  chunks: LlmChunk[]
): { id: string; title: string; text: string }[] {
  return chunks
    .map((chunk, idx) => {
      if (!chunk || typeof chunk.text !== "string") return null;
      const text = chunk.text.trim();
      if (!text) return null;
      const title = (chunk.title ?? "").trim() || `LLM Chunk ${idx + 1}`;
      return {
        id: `llm-${slugify(title)}-${idx}`,
        title,
        text: text.length > 1000 ? text.slice(0, 1000) + "..." : text,
      };
    })
    .filter(
      (chunk): chunk is { id: string; title: string; text: string } =>
        Boolean(chunk)
    );
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return value.slice(0, maxChars) + "...";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
