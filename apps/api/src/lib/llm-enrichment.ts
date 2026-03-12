export interface LlmChunk {
  title: string;
  text: string;
}

export interface LlmEnrichment {
  summary: string;
  categories: string[];
  capabilities: string[];
  keywords: string[];
  chunks: LlmChunk[];
  model: string;
}

const ENRICHMENT_MODEL = "qwen/qwen3-235b-a22b-2507";

const SYSTEM_PROMPT = `You are a skill cataloguer. Analyze the skill and respond ONLY with valid JSON.

Keys:
 - summary: <=120 word description
 - categories: array of 3-5 best-fit labels
 - capabilities: action verbs/phrases
 - keywords: search intents
 - chunks: array (3-5 items) each with {title,text} capturing distinct, self-contained segments worth embedding
   * Each chunk text should be <= 800 characters and include key instructions/examples
   * Cover diverse parts of the skill (overview, workflows, advanced tips, troubleshooting, etc.)

JSON Schema example: {"summary":"...","categories":["design"],"capabilities":["generate videos"],"keywords":["remotion"],"chunks":[{"title":"Workflow","text":"..."}]}

Guidelines:
 - summary: concise, search-friendly. Third person, start with action verb, include primary technology.
 - categories: lowercase, hyphenated. Prefer: frontend, backend, devops, database, testing, security, design, ai-ml, mobile, documentation, deployment, api, data-engineering, infrastructure, monitoring, accessibility, performance, seo, analytics, auth.
 - capabilities: concrete action phrases starting with a verb (e.g. "generate responsive layouts", "write unit tests").
 - keywords: technology names, use-case phrases, related tools/frameworks (5-10 items).
 - chunks: each covers a DISTINCT aspect, independently understandable, includes specific instructions/examples from the skill.`;

/**
 * Build the user message for LLM skill analysis.
 */
function buildUserMessage(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  const header = JSON.stringify(frontmatter, null, 2);
  return `Frontmatter:\n${header}\n\nBody:\n${body}`;
}

/**
 * Call OpenRouter to enrich a skill with summary, categories,
 * capabilities, keywords, and semantic chunks.
 *
 * Uses OpenRouter's OpenAI-compatible API with a cost-efficient model.
 */
export async function enrichSkillWithLlm(
  openRouterApiKey: string,
  frontmatter: Record<string, unknown>,
  body: string
): Promise<LlmEnrichment> {
  const userMessage = buildUserMessage(frontmatter, body);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://skillsgate.ai",
      "X-Title": "SkillsGate Vectorization",
    },
    body: JSON.stringify({
      model: ENRICHMENT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[llm-enrichment] OpenRouter ${response.status}: ${errorText}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`[llm-enrichment] OpenRouter returned empty content: ${JSON.stringify(data)}`);
  }

  // Strip markdown code fences if present
  const cleaned = content
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    categories: asStringArray(parsed.categories),
    capabilities: asStringArray(parsed.capabilities),
    keywords: asStringArray(parsed.keywords),
    chunks: asChunkArray(parsed.chunks),
    model: ENRICHMENT_MODEL,
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function asChunkArray(value: unknown): LlmChunk[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const title =
        typeof (item as any).title === "string"
          ? (item as any).title.trim()
          : "";
      const text =
        typeof (item as any).text === "string"
          ? (item as any).text.trim()
          : "";
      if (!text) return null;
      return { title: title || "Skill Segment", text };
    })
    .filter((chunk): chunk is LlmChunk => Boolean(chunk));
}
