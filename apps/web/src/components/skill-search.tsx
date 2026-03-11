import { useState, useRef, useEffect } from "react";
import { api } from "~/lib/api";
import { authClient } from "~/lib/auth-client";

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
	installCommand: string | null;
	score: number;
};

type SearchResponse = {
	results: SearchResult[];
	meta: {
		query: string;
		total: number;
		limit: number;
		remainingSearches: number;
	};
};

export function SkillSearch() {
	const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);
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

		const res = await api.post<SearchResponse>("/api/v1/search", { query: q }, { signal: controller.signal });

		if (controller.signal.aborted) return;

		setIsLoading(false);

		if (res.ok) {
			setResults(res.data.results);
			setRemaining(res.data.meta.remainingSearches);
			setNoResults(res.data.results.length === 0);
		} else if (res.status === 401) {
			setIsAuthed(false);
			setShowAuthPrompt(true);
			setError("Session expired — please sign in again");
		} else if (res.status === 429) {
			setError("Daily search limit reached. Try again tomorrow.");
			setRemaining(0);
		} else {
			setError("Something went wrong. Please try again.");
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

	function handlePlaceholderClick() {
		if (isAuthed === false) {
			setShowAuthPrompt(true);
		}
	}

	// Still loading auth state
	if (isAuthed === null) {
		return <SearchPlaceholder />;
	}

	// Unauthenticated
	if (!isAuthed) {
		return (
			<div>
				<div onClick={handlePlaceholderClick} className="cursor-pointer">
					<SearchPlaceholder />
				</div>
				{showAuthPrompt && (
					<div className="animate-slide-down mt-4 mx-auto max-w-sm">
						<div className="rounded-xl border border-border bg-card-bg p-5">
							<p className="text-[13px] text-muted text-center mb-4">
								Sign in to search 45,000+ skills
							</p>
							<div className="flex flex-col sm:flex-row gap-2.5">
								<button
									onClick={() => handleSignIn("github")}
									className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-foreground bg-surface border border-border hover:border-accent/40 transition-colors"
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
									GitHub
								</button>
								<button
									onClick={() => handleSignIn("google")}
									className="flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-foreground bg-surface border border-border hover:border-accent/40 transition-colors"
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24">
										<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
										<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
										<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
										<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
									</svg>
									Google
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Authenticated
	return (
		<div>
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
						disabled={remaining === 0}
						placeholder='Search skills — try "audit website performance"...'
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

			{/* Remaining searches counter */}
			{remaining !== null && (
				<div className="mt-2 text-right">
					<span className="text-[11px] font-mono text-muted/50">
						{remaining} search{remaining !== 1 ? "es" : ""} remaining today
					</span>
				</div>
			)}

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
				<div className="animate-slide-down mt-6 space-y-3 text-left">
					{results.map((result) => (
						<SearchResultCard key={result.skillId} result={result} />
					))}
				</div>
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

function SearchResultCard({ result }: { result: SearchResult }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		if (!result.installCommand) return;
		await navigator.clipboard.writeText(result.installCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const displayText = result.summary || result.description;

	return (
		<div className="group relative bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					{/* Name + score */}
					<div className="flex items-center gap-2.5 mb-1.5">
						<h3 className="text-[15px] font-semibold text-foreground truncate">
							{result.name}
						</h3>
						<span className="flex-shrink-0 text-[10px] font-mono text-muted/50 bg-surface-hover px-1.5 py-0.5 rounded">
							{result.score.toFixed(3)}
						</span>
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

				{/* GitHub link */}
				{result.githubUrl && (
					<a
						href={result.githubUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-shrink-0 p-1.5 rounded-md text-muted/50 hover:text-foreground transition-colors"
						title="View on GitHub"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
					</a>
				)}
			</div>
		</div>
	);
}
