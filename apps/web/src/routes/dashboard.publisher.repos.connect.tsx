import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { api } from "~/lib/api";

/* ─── Types matching API contract ─── */

type GitHubRepo = {
	id: number;
	fullName: string;
	name: string;
	owner: string;
	defaultBranch: string;
	private: boolean;
	description: string | null;
	htmlUrl: string;
	updatedAt: string;
};

type ErrorKind = "reauth_required" | "not_linked" | "generic";

function classifyError(errorMsg: string): ErrorKind {
	if (errorMsg === "github_reauth_required") return "reauth_required";
	if (errorMsg === "github_not_linked") return "not_linked";
	return "generic";
}

/* ─── Component ─── */

export default function ConnectRepoPage() {
	const navigate = useNavigate();

	const [repos, setRepos] = useState<GitHubRepo[]>([]);
	const [loading, setLoading] = useState(true);
	const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [search, setSearch] = useState("");
	const [connectingId, setConnectingId] = useState<number | null>(null);
	const [connectError, setConnectError] = useState<{
		id: number;
		message: string;
	} | null>(null);
	const [searchParams] = useSearchParams();
	const oauthError = searchParams.get("error");

	useEffect(() => {
		let cancelled = false;

		async function fetchRepos() {
			const res = await api.get<{ repos: GitHubRepo[] }>(
				"/api/github/repos",
			);

			if (cancelled) return;

			if (res.ok) {
				setRepos(res.data.repos);
			} else {
				const kind = classifyError(res.error);
				setErrorKind(kind);
				setErrorMessage(res.error);
			}
			setLoading(false);
		}

		fetchRepos();
		return () => {
			cancelled = true;
		};
	}, []);

	const filteredRepos = useMemo(() => {
		if (!search.trim()) return repos;
		const query = search.toLowerCase();
		return repos.filter(
			(r) =>
				r.fullName.toLowerCase().includes(query) ||
				r.name.toLowerCase().includes(query) ||
				(r.description?.toLowerCase().includes(query) ?? false),
		);
	}, [repos, search]);

	async function handleConnect(repo: GitHubRepo) {
		setConnectingId(repo.id);
		setConnectError(null);

		const res = await api.post("/api/connected-repos", {
			githubOwner: repo.owner,
			githubRepo: repo.name,
			githubBranch: repo.defaultBranch,
		});

		if (res.ok) {
			navigate("/dashboard/publisher/repos");
		} else if (!res.ok) {
			// If connecting fails due to reauth, show the reauth state
			if (res.error === "github_reauth_required") {
				setErrorKind("reauth_required");
				setErrorMessage(res.error);
				setConnectingId(null);
				return;
			}
			setConnectError({ id: repo.id, message: res.error });
			setConnectingId(null);
		}
	}

	function handleAuthorizeGitHub() {
		window.location.href = "/api/github/authorize";
	}

	/* ─── Back link (shared) ─── */

	const backLink = (
		<Link
			to="/dashboard/publisher/repos"
			className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors mb-6"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</svg>
			Back to repos
		</Link>
	);

	/* ─── Loading state ─── */

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	/* ─── Authorize GitHub access (reauth or not linked) ─── */

	if (errorKind === "reauth_required" || errorKind === "not_linked") {
		const isNotLinked = errorKind === "not_linked";
		return (
			<div>
				{backLink}
				{oauthError === "denied" && (
					<div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 mb-4">
						<p className="text-[13px] text-red-400">
							GitHub authorization was denied. You need to grant access to connect repos.
						</p>
					</div>
				)}
				<div className="rounded-xl border border-border bg-card-bg p-8 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="text-muted"
						>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
					</div>
					<h2 className="text-[16px] font-medium text-foreground mb-2">
						{isNotLinked
							? "Authorize GitHub Access"
							: "Re-authorize GitHub Access"}
					</h2>
					<p className="text-[13px] text-muted mb-1">
						{isNotLinked
							? "To connect repos, SkillsGate needs access to your GitHub repositories."
							: "Your GitHub authorization has expired or needs updated permissions."}
					</p>
					<p className="text-[13px] text-muted/70 mb-6">
						You'll be redirected to GitHub to choose which
						repositories to grant access to.
					</p>
					<button
						onClick={handleAuthorizeGitHub}
						className="px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
					>
						<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						Authorize with GitHub
					</button>
				</div>
			</div>
		);
	}

	/* ─── Generic error state ─── */

	if (errorKind === "generic") {
		return (
			<div>
				{backLink}
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-red-400 mb-2">
						Could not load your GitHub repos.
					</p>
					<p className="text-[13px] text-muted/70">
						{errorMessage ?? "An unexpected error occurred."}
					</p>
				</div>
			</div>
		);
	}

	/* ─── Main content ─── */

	return (
		<div>
			{backLink}

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Connect a Repository
				</h1>
				<p className="text-[14px] text-muted mt-1">
					Select a GitHub repo to sync skills from.
					{repos.length > 0 && (
						<span className="text-muted/50">
							{" "}
							&middot; {repos.length} repo
							{repos.length !== 1 ? "s" : ""} available
						</span>
					)}
				</p>
			</div>

			{/* Search */}
			{repos.length > 0 && (
				<div className="mb-4">
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search repositories..."
						className="w-full px-3 py-2 text-[14px] text-foreground bg-transparent border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
					/>
				</div>
			)}

			{/* Repo list */}
			{repos.length === 0 ? (
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-muted/50"
						>
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
						</svg>
					</div>
					<p className="text-[15px] text-muted mb-2">
						No repositories found
					</p>
					<p className="text-[13px] text-muted/70">
						Make sure your GitHub account has repositories, or check
						that all your repos aren't already connected.
					</p>
				</div>
			) : filteredRepos.length > 0 ? (
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden divide-y divide-border">
					{filteredRepos.map((repo) => (
						<div
							key={repo.id}
							className="px-5 py-4 hover:bg-surface-hover transition-colors"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2 mb-1">
										<p className="text-[14px] font-medium text-foreground font-mono truncate">
											{repo.fullName}
										</p>
										{repo.private ? (
											<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
												Private
											</span>
										) : (
											<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
												Public
											</span>
										)}
									</div>
									{repo.description && (
										<p className="text-[13px] text-muted truncate mb-1">
											{repo.description}
										</p>
									)}
									<span className="text-[12px] text-muted/50">
										default branch:{" "}
										<span className="font-mono text-muted">
											{repo.defaultBranch}
										</span>
									</span>
									{connectError?.id === repo.id && (
										<p className="text-[12px] text-red-400 mt-2">
											{connectError.message}
										</p>
									)}
								</div>
								<div className="flex-shrink-0">
									<button
										onClick={() => handleConnect(repo)}
										disabled={connectingId === repo.id}
										className="px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
									>
										{connectingId === repo.id ? (
											<>
												<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
												Connecting...
											</>
										) : (
											"Connect"
										)}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-muted mb-2">
						No repos match your search.
					</p>
					<p className="text-[13px] text-muted/70">
						Try a different search term.
					</p>
				</div>
			)}
		</div>
	);
}
