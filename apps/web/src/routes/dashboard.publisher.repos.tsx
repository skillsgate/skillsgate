import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ConfirmationDialog, useApiClient } from "@skillsgate/ui";

/* ─── Types matching API contract ─── */

type ConnectedRepo = {
	id: string;
	githubOwner: string;
	githubRepo: string;
	githubBranch: string;
	skillCount: number;
	lastSyncedAt: string | null;
	syncStatus: "pending" | "syncing" | "synced" | "error";
	syncError: string | null;
	createdAt: string;
};

/* ─── Helpers ─── */

function formatRelativeDate(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days === 1) return "1 day ago";
	if (days < 30) return `${days} days ago`;
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function getSyncStatusBadge(status: ConnectedRepo["syncStatus"]) {
	switch (status) {
		case "pending":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
					Pending
				</span>
			);
		case "syncing":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
					Syncing
				</span>
			);
		case "synced":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
					Synced
				</span>
			);
		case "error":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
					Error
				</span>
			);
		default:
			return null;
	}
}

/* ─── Component ─── */

export default function PublisherReposPage() {
	const api = useApiClient();
	const [repos, setRepos] = useState<ConnectedRepo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [syncingId, setSyncingId] = useState<string | null>(null);
	const [needsInstall, setNeedsInstall] = useState(false);
	const [disconnectTarget, setDisconnectTarget] =
		useState<ConnectedRepo | null>(null);
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [disconnectError, setDisconnectError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchRepos() {
			const res = await api.get<{ repos: ConnectedRepo[] }>(
				"/api/connected-repos",
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

	async function handleSync(id: string) {
		setSyncingId(id);

		const res = await api.post(`/api/connected-repos/${id}/sync`);

		if (res.ok) {
			// Refresh repo data
			const refreshRes = await api.get<{ repos: ConnectedRepo[] }>(
				"/api/connected-repos",
			);
			if (refreshRes.ok) {
				setRepos(refreshRes.data.repos);
			}
		} else if (!res.ok && res.error === "github_install_required") {
			setNeedsInstall(true);
		}

		setSyncingId(null);
	}

	async function handleDisconnect() {
		if (!disconnectTarget) return;
		setIsDisconnecting(true);
		setDisconnectError(null);

		try {
			const res = await api.delete(
				`/api/connected-repos/${disconnectTarget.id}`,
			);

			if (res.ok) {
				setRepos((prev) =>
					prev.filter((r) => r.id !== disconnectTarget.id),
				);
				setIsDisconnecting(false);
				setDisconnectTarget(null);
			} else {
				setDisconnectError(res.error ?? "Failed to disconnect repo.");
				setIsDisconnecting(false);
			}
		} catch {
			setDisconnectError("Network error. Please try again.");
			setIsDisconnecting(false);
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
					to="/dashboard/publisher/skills"
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
					Back to skills
				</Link>
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-red-400 mb-2">
						Failed to load connected repos.
					</p>
					<p className="text-[13px] text-muted/70">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Back link */}
			<Link
				to="/dashboard/publisher/skills"
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
				Back to skills
			</Link>

			{/* Reauth banner */}
			{needsInstall && (
				<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 flex items-center justify-between">
					<p className="text-[13px] text-amber-400">
						GitHub App access is missing. Reinstall to sync repos.
					</p>
					<a
						href="/api/github/authorize"
						className="px-3 py-1.5 text-[12px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors flex-shrink-0 ml-4"
					>
						Install App
					</a>
				</div>
			)}

			{/* Header */}
			<div className="flex items-start justify-between mb-8">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Connected Repos
					</h1>
					<p className="text-[14px] text-muted mt-1">
						GitHub repos syncing skills automatically.
					</p>
				</div>
				<Link
					to="/dashboard/publisher/repos/connect"
					className="px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
				>
					Connect a Repo
				</Link>
			</div>

			{/* Repo cards */}
			{repos.length > 0 ? (
				<div className="space-y-3">
					{repos.map((repo) => (
						<div
							key={repo.id}
							className="rounded-xl border border-card-border bg-card-bg px-5 py-4"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3 mb-1">
										<p className="text-[14px] font-medium text-foreground font-mono truncate">
											{repo.githubOwner}/{repo.githubRepo}
										</p>
										{getSyncStatusBadge(repo.syncStatus)}
									</div>
									<div className="flex items-center gap-4 mt-2">
										<span className="text-[12px] text-muted">
											<span className="text-muted/50">branch</span>{" "}
											<span className="font-mono">
												{repo.githubBranch}
											</span>
										</span>
										<span className="text-[12px] text-muted">
											<span className="text-muted/50">skills</span>{" "}
											<span className="font-mono">
												{repo.skillCount}
											</span>
										</span>
										<span className="text-[12px] text-muted">
											<span className="text-muted/50">synced</span>{" "}
											<span className="font-mono">
												{repo.lastSyncedAt
													? formatRelativeDate(
															repo.lastSyncedAt,
														)
													: "never"}
											</span>
										</span>
									</div>
									{repo.syncStatus === "error" &&
										repo.syncError && (
											<p className="text-[12px] text-red-400 mt-2">
												{repo.syncError}
											</p>
										)}
								</div>
								<div className="flex items-center gap-2 flex-shrink-0">
									<button
										onClick={() => handleSync(repo.id)}
										disabled={
											syncingId === repo.id ||
											repo.syncStatus === "syncing"
										}
										className="px-3 py-1.5 text-[12px] font-medium text-muted border border-border rounded-lg hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
									>
										{syncingId === repo.id ? (
											<>
												<div className="h-3 w-3 animate-spin rounded-full border-2 border-muted/30 border-t-foreground" />
												Syncing...
											</>
										) : (
											"Sync Now"
										)}
									</button>
									<button
										onClick={() =>
											setDisconnectTarget(repo)
										}
										className="px-3 py-1.5 text-[12px] font-medium text-muted border border-border rounded-lg hover:text-red-400 hover:border-red-400/30 transition-colors"
									>
										Disconnect
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-muted mb-2">
						No repos connected yet.
					</p>
					<p className="text-[13px] text-muted/70 mb-4">
						Connect a GitHub repo to auto-sync skills.
					</p>
					<Link
						to="/dashboard/publisher/repos/connect"
						className="inline-flex px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
					>
						Connect a Repo
					</Link>
				</div>
			)}

			{/* Disconnect confirmation */}
			{disconnectTarget && (
				<ConfirmationDialog
					title="Disconnect repo?"
					message={`Disconnect ${disconnectTarget.githubOwner}/${disconnectTarget.githubRepo}? Skills synced from this repo will remain but will no longer update automatically.`}
					confirmLabel="Disconnect"
					onConfirm={handleDisconnect}
					onCancel={() => {
						setDisconnectTarget(null);
						setDisconnectError(null);
					}}
					isLoading={isDisconnecting}
					error={disconnectError}
				/>
			)}
		</div>
	);
}
