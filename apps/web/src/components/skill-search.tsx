import { useState, useRef, useEffect } from "react";
import { api, publicApi } from "~/lib/api";
import { authClient } from "~/lib/auth-client";
import { FavoritesProvider } from "~/hooks/use-favorites";
import { FavoriteButton } from "~/components/favorite-button";

type SearchResult = {
	skillId: string;
	slug: string;
	name: string;
	description: string;
	summary: string;
	categories: string[];
	capabilities: string[];
	keywords: string[];
	githubUrl: string;
	githubStars: number | null;
	installCommand: string | null;
	urlPath: string;
	score: number;
};

function formatStars(stars: number): string {
	if (stars >= 1000) {
		return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
	}
	return String(stars);
}

type SemanticSearchResponse = {
	results: SearchResult[];
	meta: {
		query: string;
		total: number;
		limit: number;
		remainingSearches: number;
	};
};

type KeywordSearchResponse = {
	skills: {
		skillId: string;
		slug: string;
		name: string;
		description: string;
		summary: string;
		categories: string[];
		capabilities: string[];
		keywords: string[];
		githubUrl: string;
		githubStars: number | null;
		installCommand: string | null;
		urlPath: string;
	}[];
	meta: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
};

export function SkillSearch() {
	const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
	const [mode, setMode] = useState<"semantic" | "keyword">("semantic");
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [remaining, setRemaining] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [noResults, setNoResults] = useState(false);

	const abortRef = useRef<AbortController | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		authClient.getSession().then((res) => {
			setIsAuthed(!!res.data?.user);
		});
	}, []);

	useEffect(() => {
		return () => {
			if (abortRef.current) abortRef.current.abort();
		};
	}, []);

	async function searchKeyword(q: string, signal: AbortSignal) {
		const res = await publicApi.get<KeywordSearchResponse>(
			`/api/v1/skills/search?q=${encodeURIComponent(q)}&limit=20`,
			{ signal }
		);

		if (signal.aborted) return;
		setIsLoading(false);

		if (res.ok) {
			const mapped: SearchResult[] = res.data.skills
				.map((s) => ({
					...s,
					score: 0,
				}))
				.sort((a, b) => (b.githubStars ?? 0) - (a.githubStars ?? 0));
			setResults(mapped);
			setNoResults(mapped.length === 0);
		} else if (res.status === 429) {
			setError("Rate limit exceeded. Try again in a minute.");
		} else {
			setError(res.error || "Something went wrong. Please try again.");
		}
	}

	async function searchSemantic(q: string, signal: AbortSignal) {
		const res = await api.post<SemanticSearchResponse>(
			"/api/v1/search",
			{ query: q },
			{ signal }
		);

		if (signal.aborted) return;
		setIsLoading(false);

		if (res.ok) {
			setResults(res.data.results);
			setRemaining(res.data.meta.remainingSearches);
			setNoResults(res.data.results.length === 0);
		} else if (res.status === 401) {
			setIsAuthed(false);
			setError("Session expired — please sign in again");
		} else if (res.status === 429) {
			setError("Daily search limit reached. Try again tomorrow.");
			setRemaining(0);
		} else {
			setError("Something went wrong. Please try again.");
		}
	}

	async function search(q: string) {
		if (abortRef.current) abortRef.current.abort();

		if (q.length < 2) {
			setError("Enter at least 2 characters");
			return;
		}

		const controller = new AbortController();
		abortRef.current = controller;
		setIsLoading(true);
		setError(null);
		setNoResults(false);

		if (isAuthed && mode === "semantic") {
			await searchSemantic(q, controller.signal);
		} else {
			await searchKeyword(q, controller.signal);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			e.preventDefault();
			search(query.trim());
		}
	}

	function handleSignIn(provider: "github" | "google") {
		authClient.signIn.social({
			provider,
			callbackURL: "/",
		});
	}

	// Still loading auth state
	if (isAuthed === null) {
		return <SearchPlaceholder />;
	}

	return (
		<div>
			{/* Search input */}
			<div className="relative group">
				<div className="absolute inset-0 rounded-xl border border-border group-focus-within:border-accent/40 transition-colors" />
				<div className="relative flex items-center px-5 py-4">
					<svg
						className="w-4 h-4 text-muted mr-3 flex-shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={isAuthed && mode === "semantic" && remaining === 0}
						placeholder={
							isAuthed && mode === "semantic"
								? 'Search skills — try "audit website performance"...'
								: "Search skills by keyword..."
						}
						className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted/60 placeholder:font-light focus:outline-none disabled:opacity-50"
					/>
					{!isLoading && query.length === 0 && (
						<span className="ml-3 flex-shrink-0 text-[11px] font-mono text-muted/40 hidden sm:block">
							ENTER
						</span>
					)}
					{isLoading && (
						<div className="ml-3 flex-shrink-0">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
						</div>
					)}
				</div>
			</div>

			{/* Mode indicator */}
			<div className="mt-2 flex items-center justify-between">
				<span className="text-[11px] font-mono text-muted/50">
					{isAuthed ? (
						<>
							<button
								onClick={() => setMode("semantic")}
								className={`transition-colors ${mode === "semantic" ? "text-foreground" : "text-muted/40 hover:text-muted/70"}`}
							>
								&#10022; AI semantic
							</button>
							<span className="text-muted/30 mx-1.5">|</span>
							<button
								onClick={() => setMode("keyword")}
								className={`transition-colors ${mode === "keyword" ? "text-foreground" : "text-muted/40 hover:text-muted/70"}`}
							>
								Keyword
							</button>
						</>
					) : (
						<>
							Keyword search{" "}
							<span className="text-muted/30">|</span>{" "}
							<button
								onClick={() => handleSignIn("github")}
								className="text-accent hover:text-accent/80 transition-colors"
							>
								Sign in for AI-powered search &rarr;
							</button>
						</>
					)}
				</span>
				{isAuthed && mode === "semantic" && remaining !== null && (
					<span className="text-[11px] font-mono text-muted/50">
						{remaining} search{remaining !== 1 ? "es" : ""} remaining today
					</span>
				)}
			</div>

			{/* Error */}
			{error && (
				<div className="animate-slide-down mt-4 text-center">
					<p className="text-[13px] text-muted">{error}</p>
				</div>
			)}

			{/* No results */}
			{noResults && !error && (
				<div className="animate-slide-down mt-4 text-center">
					<p className="text-[13px] text-muted">No skills found for "{query}"</p>
				</div>
			)}

			{/* Results */}
			{results.length > 0 && (
				<FavoritesProvider initialSkillIds={results.map((r) => r.skillId)}>
					<div className="animate-slide-down mt-6 space-y-3 text-left">
						{results.map((result) => (
							<SearchResultCard key={result.skillId} result={result} showScore={isAuthed ?? false} />
						))}
					</div>
				</FavoritesProvider>
			)}
		</div>
	);
}

function SearchPlaceholder() {
	return (
		<div className="relative group">
			<div className="absolute inset-0 rounded-xl border border-border group-hover:border-accent/40 transition-colors" />
			<div className="relative flex items-center px-5 py-4">
				<svg
					className="w-4 h-4 text-muted mr-3 flex-shrink-0"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<span className="text-[14px] text-muted/60 font-light">
					Search skills — try "audit website performance" or "react testing"...
				</span>
			</div>
		</div>
	);
}

function SearchResultCard({ result, showScore }: { result: SearchResult; showScore: boolean }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy(e: React.MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (!result.installCommand) return;
		await navigator.clipboard.writeText(result.installCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const displayText = result.summary || result.description;

	return (
		<a
			href={`/skills/${result.urlPath}`}
			className="group relative block bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 no-underline"
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					{/* Name + score + stars */}
					<div className="flex items-center gap-2.5 mb-1.5">
						<h3 className="text-[15px] font-semibold text-foreground truncate">
							{result.name}
						</h3>
						{result.githubStars != null && result.githubStars > 0 && (
							<span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-mono text-muted/60">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400/70">
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								{formatStars(result.githubStars)}
							</span>
						)}
						{showScore && result.score > 0 && (
							<span className="flex-shrink-0 text-[10px] font-mono text-muted/50 bg-surface-hover px-1.5 py-0.5 rounded">
								{result.score.toFixed(3)}
							</span>
						)}
					</div>

					{/* Description */}
					{displayText && (
						<p className="text-[13px] text-muted leading-relaxed line-clamp-2 mb-3">
							{displayText}
						</p>
					)}

					{/* Categories */}
					{result.categories.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mb-3">
							{result.categories.map((cat) => (
								<span
									key={cat}
									className="text-[10px] font-mono tracking-wider uppercase text-muted/60 bg-surface-hover px-2 py-0.5 rounded"
								>
									{cat}
								</span>
							))}
						</div>
					)}

					{/* Install command */}
					{result.installCommand && (
						<div className="flex items-center gap-2">
							<code className="text-[12px] font-mono text-muted bg-code-bg px-3 py-1.5 rounded-md border border-border overflow-x-auto max-w-full">
								$ {result.installCommand}
							</code>
							<button
								onClick={handleCopy}
								className="flex-shrink-0 p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
								title="Copy install command"
							>
								{copied ? (
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								) : (
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
										<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
									</svg>
								)}
							</button>
						</div>
					)}
				</div>

				{/* Favorite + GitHub link */}
				<div className="flex flex-shrink-0 items-center gap-1">
					<FavoriteButton skillId={result.skillId} />
				{result.githubUrl && (
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							window.open(result.githubUrl, "_blank", "noopener,noreferrer");
						}}
						className="flex-shrink-0 p-1.5 rounded-md bg-transparent border-none text-muted/50 hover:text-foreground transition-colors cursor-pointer"
						title="View on GitHub"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
					</button>
				)}
				</div>
			</div>
		</a>
	);
}
