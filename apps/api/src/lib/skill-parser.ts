export interface ParsedSkillMd {
  name?: string;
  description?: string;
  summary?: string;
  categories?: string[];
  capabilities?: string[];
  keywords?: string[];
}

/**
 * Parse a SKILL.md file to extract metadata.
 *
 * Supports two formats:
 * 1. YAML frontmatter between `---` fences (structured metadata)
 * 2. Fallback: first `# heading` as name, first paragraph as description
 */
export function parseSkillMd(content: string): ParsedSkillMd {
  const result: ParsedSkillMd = {};

  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (frontmatterMatch) {
    const yaml = frontmatterMatch[1];
    parseFrontmatter(yaml, result);
  }

  // Fallback: extract from markdown content if frontmatter didn't provide values
  const body = frontmatterMatch
    ? content.slice(frontmatterMatch[0].length).trim()
    : content.trim();

  if (!result.name) {
    const headingMatch = body.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      result.name = headingMatch[1].trim();
    }
  }

  if (!result.description) {
    // Find first non-heading, non-empty paragraph
    const lines = body.split(/\r?\n/);
    let inParagraph = false;
    const paragraphLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || trimmed === "") {
        if (inParagraph && paragraphLines.length > 0) break;
        continue;
      }
      inParagraph = true;
      paragraphLines.push(trimmed);
    }

    if (paragraphLines.length > 0) {
      result.description = paragraphLines.join(" ");
    }
  }

  return result;
}

/**
 * Simple YAML frontmatter parser.
 * Handles scalar values and simple lists (both inline `[a, b]` and `- item` style).
 */
function parseFrontmatter(yaml: string, result: ParsedSkillMd): void {
  const lines = yaml.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  const scalarKeys = ["name", "description", "summary"] as const;
  const listKeys = ["categories", "capabilities", "keywords"] as const;

  for (const line of lines) {
    // Check for a new key-value pair
    const kvMatch = line.match(/^(\w+)\s*:\s*(.*)/);
    if (kvMatch) {
      // Flush any pending list
      if (currentKey && currentList) {
        flushList(result, currentKey, currentList);
      }

      const key = kvMatch[1];
      const value = kvMatch[2].trim();

      if ((scalarKeys as readonly string[]).includes(key)) {
        currentKey = null;
        currentList = null;
        result[key as (typeof scalarKeys)[number]] = stripQuotes(value);
      } else if ((listKeys as readonly string[]).includes(key)) {
        currentKey = key;
        // Check for inline array: [a, b, c]
        const inlineMatch = value.match(/^\[(.+)]$/);
        if (inlineMatch) {
          result[key as (typeof listKeys)[number]] = inlineMatch[1]
            .split(",")
            .map((s) => stripQuotes(s.trim()))
            .filter(Boolean);
          currentKey = null;
          currentList = null;
        } else if (value === "" || value === "[]") {
          currentList = [];
        } else {
          // Single value on the same line as key
          currentList = [stripQuotes(value)];
        }
      } else {
        currentKey = null;
        currentList = null;
      }
      continue;
    }

    // Check for list item under a list key
    if (currentKey && currentList !== null) {
      const itemMatch = line.match(/^\s+-\s+(.*)/);
      if (itemMatch) {
        currentList.push(stripQuotes(itemMatch[1].trim()));
        continue;
      }
    }

    // If we reach a non-matching line, flush
    if (currentKey && currentList) {
      flushList(result, currentKey, currentList);
      currentKey = null;
      currentList = null;
    }
  }

  // Flush remaining
  if (currentKey && currentList) {
    flushList(result, currentKey, currentList);
  }
}

function flushList(
  result: ParsedSkillMd,
  key: string,
  list: string[],
): void {
  if (list.length > 0) {
    (result as Record<string, unknown>)[key] = list;
  }
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}
