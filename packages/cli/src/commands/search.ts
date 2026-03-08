import * as p from "@clack/prompts";
import pc from "picocolors";
import { SEARCH_API_URL } from "../constants.js";
import { getToken } from "../utils/auth-store.js";
import { fmt } from "../ui/format.js";
import { trackSearch } from "../telemetry.js";

interface SearchResult {
  skillId: string;
  slug: string;
  name: string;
  summary: string;
  categories: string[];
  capabilities: string[];
  keywords: string[];
  githubUrl: string;
  installCommand: string | null;
  score?: number;
}

interface SearchResponse {
  results: SearchResult[];
  meta: {
    query: string;
    total: number;
    limit: number;
    remainingSearches: number;
  };
}

function buildInstallCmd(githubUrl: string): string | null {
  if (!githubUrl) return null;
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const ownerRepo = `${parts[0]}/${parts[1]}`;
    if (parts.length > 4) {
      const pathParts = parts.slice(4);
      if (pathParts.at(-1)?.toUpperCase() === "SKILL.MD") pathParts.pop();
      if (pathParts.length > 0) {
        return `skillsgate add ${ownerRepo}@${pathParts.at(-1)} -y`;
      }
    }
    return `skillsgate add ${ownerRepo} -y`;
  } catch {
    return null;
  }
}

export async function runSearch(args: string[]): Promise<void> {
  const query = args.join(" ").trim();

  if (!query) {
    p.log.error(fmt.error("Please provide a search query."));
    console.log(`  ${pc.dim("Usage:")} skillsgate search <query>`);
    console.log(`  ${pc.dim("Example:")} skillsgate search "tailwind CSS"`);
    process.exit(1);
  }

  if (query.length > 500) {
    p.log.error(fmt.error("Query must be 500 characters or less."));
    process.exit(1);
  }

  const token = await getToken();
  if (!token) {
    p.log.error(
      fmt.error("Not authenticated. Run ") +
        pc.bold("skillsgate login") +
        fmt.error(" first.")
    );
    process.exit(1);
  }

  const spin = p.spinner();
  spin.start(`Searching for "${query}"...`);

  try {
    const response = await fetch(`${SEARCH_API_URL}/api/v1/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (response.status === 401) {
      spin.stop("Authentication failed");
      p.log.error(
        fmt.error("Session expired. Run ") +
          pc.bold("skillsgate login") +
          fmt.error(" to re-authenticate.")
      );
      process.exit(1);
    }

    if (response.status === 429) {
      spin.stop("Rate limited");
      const body = await response.json() as { message?: string };
      p.log.warn(
        fmt.warn(body.message ?? "Rate limit exceeded. Please try again later.")
      );
      process.exit(1);
    }

    if (!response.ok) {
      spin.stop("Search failed");
      const body = await response.json() as { error?: string };
      p.log.error(fmt.error(body.error ?? `Request failed (${response.status})`));
      process.exit(1);
    }

    const data = (await response.json()) as SearchResponse;
    spin.stop(`Found ${data.results.length} skill${data.results.length !== 1 ? "s" : ""}`);

    trackSearch({
      query,
      resultCount: data.results.length,
      scores: data.results.map((r) => r.score).filter((s): s is number => s !== undefined),
    });

    if (data.results.length === 0) {
      p.log.info("No skills found matching your query.");
      return;
    }

    console.log();
    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i];

      console.log(
        `  ${pc.bold(pc.cyan(`${i + 1}. ${result.name}`))}`
      );

      if (result.summary) {
        console.log(`     ${pc.dim(result.summary)}`);
      }

      if (result.categories.length > 0) {
        console.log(`     ${pc.dim("Categories:")} ${result.categories.join(", ")}`);
      }

      const installCmd = buildInstallCmd(result.githubUrl);
      if (installCmd) {
        console.log(`     ${pc.green("$")} ${installCmd}`);
      }

      if (result.githubUrl) {
        console.log(`     ${pc.dim(result.githubUrl)}`);
      }

      console.log();
    }

    p.log.info(
      fmt.dim(
        `${data.meta.remainingSearches} search${data.meta.remainingSearches !== 1 ? "es" : ""} remaining today`
      )
    );
  } catch (err) {
    spin.stop("Search failed");
    if (err instanceof TypeError && (err as any).cause?.code === "ECONNREFUSED") {
      p.log.error(fmt.error("Could not connect to the search API. Please try again later."));
    } else {
      p.log.error(fmt.error(String((err as Error).message ?? err)));
    }
    process.exit(1);
  }
}
