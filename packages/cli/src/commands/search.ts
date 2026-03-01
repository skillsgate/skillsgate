import * as p from "@clack/prompts";
import pc from "picocolors";
import { SEARCH_API_URL } from "../constants.js";
import { getToken } from "../utils/auth-store.js";
import { fmt } from "../ui/format.js";

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

    if (data.results.length === 0) {
      p.log.info("No skills found matching your query.");
      return;
    }

    console.log();
    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i];

      console.log(
        `  ${pc.bold(pc.cyan(`${i + 1}. ${result.name}`))}${result.slug ? pc.dim(` (${result.slug})`) : ""}`
      );

      if (result.summary) {
        console.log(`     ${pc.dim(result.summary)}`);
      }

      if (result.categories.length > 0) {
        console.log(`     ${pc.dim("Categories:")} ${result.categories.join(", ")}`);
      }

      if (result.installCommand) {
        console.log(`     ${pc.green("$")} ${result.installCommand}`);
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
