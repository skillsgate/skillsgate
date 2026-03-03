import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
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

/* ─── Component ─── */

export default function ConnectRepoPage() {
	const navigate = useNavigate();

	const [repos, setRepos] = useState<GitHubRepo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [search, setSearch] = useState("");
	const [connectingId, setConnectingId] = useState<number | null>(null);
	const [connectError, setConnectError] = useState<{
		id: number;
		message: string;
	} | null>(null);

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
				setError(res.error);
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
			setConnectError({ id: repo.id, message: res.error });
			setConnectingId(null);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div>
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
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-red-400 mb-2">
						Could not load your GitHub repos.
					</p>
					<p className="text-[13px] text-muted/70">
						Make sure you signed in with GitHub.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Back link */}
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

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Connect a Repository
				</h1>
				<p className="text-[14px] text-muted mt-1">
					Select a GitHub repo to sync skills from.
				</p>
			</div>

			{/* Search */}
			<div className="mb-4">
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search repositories..."
					className="w-full px-3 py-2 text-[14px] text-foreground bg-transparent border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
				/>
			</div>

			{/* Repo list */}
			{filteredRepos.length > 0 ? (
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
						{search.trim()
							? "No repos match your search."
							: "No repositories found."}
					</p>
					<p className="text-[13px] text-muted/70">
						{search.trim()
							? "Try a different search term."
							: "Make sure your GitHub account has repositories."}
					</p>
				</div>
			)}
		</div>
	);
}
