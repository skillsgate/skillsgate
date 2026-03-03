export interface TextChunk {
  /** Section heading or "Overview" for the intro */
  title: string;
  /** Chunk text content */
  text: string;
  /** 0-based chunk index in document order */
  index: number;
}

const DEFAULT_MAX_CHUNK_SIZE = 1500;
const MIN_CHUNK_SIZE = 100;

/**
 * Splits SKILL.md markdown content into chunks suitable for embedding.
 *
 * Strategy:
 * 1. Split by `## ` headings into logical sections.
 * 2. If a section exceeds maxChunkSize, split on paragraph boundaries (`\n\n`).
 * 3. The first chunk always includes the skill name for identity context.
 * 4. Target: 500-1500 characters per chunk.
 */
export function chunkSkillContent(
  skillName: string,
  markdownContent: string,
  maxChunkSize: number = DEFAULT_MAX_CHUNK_SIZE
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  const sections = splitBySections(markdownContent);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    let title = section.heading;
    let body = section.content.trim();

    // First chunk gets the skill name prepended for identity
    if (i === 0) {
      title = title || "Overview";
      if (!body.toLowerCase().startsWith(skillName.toLowerCase())) {
        body = `${skillName}\n\n${body}`;
      }
    }

    if (!body) {
      continue;
    }

    if (body.length <= maxChunkSize) {
      chunks.push({ title, text: body, index: chunkIndex++ });
    } else {
      // Split oversized sections on paragraph boundaries
      const paragraphChunks = splitOnParagraphs(body, maxChunkSize);
      for (const paragraphText of paragraphChunks) {
        if (paragraphText.trim().length < MIN_CHUNK_SIZE) {
          // Merge tiny trailing fragments into the previous chunk
          if (chunks.length > 0) {
            chunks[chunks.length - 1].text += "\n\n" + paragraphText.trim();
          } else {
            chunks.push({
              title,
              text: paragraphText.trim(),
              index: chunkIndex++,
            });
          }
          continue;
        }
        chunks.push({ title, text: paragraphText.trim(), index: chunkIndex++ });
      }
    }
  }

  return chunks;
}

interface Section {
  heading: string;
  content: string;
}

/**
 * Splits markdown content by `## ` headings.
 * Content before the first heading becomes a section with an empty heading.
 */
function splitBySections(markdown: string): Section[] {
  const sections: Section[] = [];
  // Match lines that start with "## " (h2 headings)
  const headingPattern = /^## (.+)$/gm;
  let lastIndex = 0;
  let lastHeading = "";
  let match: RegExpExecArray | null;

  match = headingPattern.exec(markdown);

  if (match === null) {
    // No headings at all — entire content is one section
    return [{ heading: "", content: markdown }];
  }

  // Content before the first heading
  if (match.index > 0) {
    const preContent = markdown.slice(0, match.index).trim();
    if (preContent) {
      sections.push({ heading: "", content: preContent });
    }
  }

  lastIndex = match.index + match[0].length;
  lastHeading = match[1].trim();

  while ((match = headingPattern.exec(markdown)) !== null) {
    const content = markdown.slice(lastIndex, match.index).trim();
    if (content) {
      sections.push({ heading: lastHeading, content });
    }
    lastIndex = match.index + match[0].length;
    lastHeading = match[1].trim();
  }

  // Last section
  const remaining = markdown.slice(lastIndex).trim();
  if (remaining) {
    sections.push({ heading: lastHeading, content: remaining });
  }

  return sections;
}

/**
 * Splits text on paragraph boundaries (`\n\n`) to stay within maxChunkSize.
 * Greedily accumulates paragraphs until the next would exceed the limit.
 */
function splitOnParagraphs(text: string, maxSize: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const result: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;

    if (current && current.length + 2 + paragraph.length > maxSize) {
      result.push(current);
      current = paragraph;
    } else {
      current = current ? current + "\n\n" + paragraph : paragraph;
    }
  }

  if (current.trim()) {
    result.push(current);
  }

  // Handle edge case: a single paragraph longer than maxSize
  // In this case we just keep it as-is rather than splitting mid-sentence
  return result;
}
