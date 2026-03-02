import { useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "~/lib/api";
import { UserSearch } from "~/components/user-search";
import { ConfirmationDialog } from "~/components/confirmation-dialog";

/* ─── Types matching API contract ─── */

type ShareUser = {
	id: string;
	name: string;
	image: string | null;
	githubUsername: string;
};

type Share = {
	user: ShareUser;
	role: string;
	grantedAt: string;
};

type SkillDetail = {
	id: string;
	slug: string;
	name: string;
	description: string;
	visibility: "public" | "private" | "premium";
	sourceType: string;
	createdAt: string;
	updatedAt: string;
	downloads: number;
	priceCents: number | null;
};

type SkillDetailData = {
	skill: SkillDetail;
	shares: Share[];
	shareCount: number;
	shareLimit: number;
};

/* ─── Mock data (swap for real API calls) ─── */

function getMockData(id: string): SkillDetailData {
	return {
		skill: {
			id,
			slug: "deploy-helper",
			name: "deploy-helper",
			description: "Automated deployment helper for CI/CD pipelines",
			visibility: "private",
			sourceType: "direct",
			createdAt: "2026-02-15T00:00:00Z",
			updatedAt: "2026-03-01T00:00:00Z",
			downloads: 0,
			priceCents: null,
		},
		shares: [
			{
				user: {
					id: "u_owner",
					name: "You",
					image: null,
					githubUsername: "you",
				},
				role: "publisher",
				grantedAt: "2026-02-15T00:00:00Z",
			},
			{
				user: {
					id: "u_1",
					name: "Alice Chen",
					image: null,
					githubUsername: "alice",
				},
				role: "reader",
				grantedAt: "2026-02-20T00:00:00Z",
			},
			{
				user: {
					id: "u_2",
					name: "Charlie Brown",
					image: null,
					githubUsername: "charlie",
				},
				role: "reader",
				grantedAt: "2026-02-22T00:00:00Z",
			},
		],
		shareCount: 3,
		shareLimit: 10,
	};
}

/* ─── Helpers ─── */

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function getVisibilityBadge(visibility: string) {
	switch (visibility) {
		case "public":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
					Public
				</span>
			);
		case "private":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
					Private
				</span>
			);
		case "premium":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
					Premium
				</span>
			);
		default:
			return null;
	}
}

/* ─── Component ─── */

export default function SkillDetailPage() {
	const { id } = useParams();
	const [data, setData] = useState<SkillDetailData>(() =>
		getMockData(id ?? ""),
	);
	const [revokeTarget, setRevokeTarget] = useState<Share | null>(null);
	const [isRevoking, setIsRevoking] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [shareError, setShareError] = useState<string | null>(null);

	async function handleShare(user: {
		id: string;
		name: string;
		image: string | null;
		githubUsername: string;
	}) {
		setIsSharing(true);
		setShareError(null);

		const res = await api.post<{
			share: Share;
		}>(`/api/skills/${id}/shares`, {
			githubUsername: user.githubUsername,
		});

		setIsSharing(false);

		if (res.ok) {
			setData((prev) => ({
				...prev,
				shares: [...prev.shares, res.data.share],
				shareCount: prev.shareCount + 1,
			}));
		} else if (!res.ok && res.status === 404) {
			setShareError(
				`@${user.githubUsername} isn't on SkillsGate yet.`,
			);
		} else if (!res.ok && res.status === 409) {
			setShareError(
				`@${user.githubUsername} already has access.`,
			);
		} else if (!res.ok) {
			setShareError(res.error);
		}
	}

	async function handleRevoke() {
		if (!revokeTarget) return;
		setIsRevoking(true);

		const res = await api.delete(
			`/api/skills/${id}/shares/${revokeTarget.user.id}`,
		);

		if (res.ok) {
			setData((prev) => ({
				...prev,
				shares: prev.shares.filter(
					(s) => s.user.id !== revokeTarget.user.id,
				),
				shareCount: prev.shareCount - 1,
			}));
		}

		setIsRevoking(false);
		setRevokeTarget(null);
	}

	const isPrivate = data.skill.visibility === "private";
	const existingUserIds = data.shares.map((s) => s.user.id);

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

			{/* Header */}
			<div className="flex items-start justify-between mb-8">
				<div>
					<div className="flex items-center gap-3 mb-1">
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							{data.skill.name}
						</h1>
						{getVisibilityBadge(data.skill.visibility)}
					</div>
					<p className="text-[13px] text-muted">
						{data.skill.visibility.charAt(0).toUpperCase() +
							data.skill.visibility.slice(1)}{" "}
						skill
						{" "}
						<span className="text-muted/50">
							Created {formatDate(data.skill.createdAt)}
						</span>
					</p>
				</div>
			</div>

			{/* Sharing section (only for private skills) */}
			{isPrivate && (
				<section className="mb-8">
					<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
						<div className="px-5 py-4 border-b border-border">
							<h2 className="text-[14px] font-semibold text-foreground">
								Sharing
							</h2>
							<p className="text-[12px] text-muted mt-0.5">
								People with access to this skill.
							</p>
						</div>

						{/* Access list */}
						<div className="divide-y divide-border">
							{data.shares.map((share) => {
								const isOwner =
									share.role === "publisher" || share.role === "owner";
								return (
									<div
										key={share.user.id}
										className="flex items-center justify-between px-5 py-3"
									>
										<div className="flex items-center gap-3 min-w-0">
											{share.user.image ? (
												<img
													src={share.user.image}
													alt=""
													className="h-7 w-7 rounded-full flex-shrink-0"
												/>
											) : (
												<div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover border border-border text-[10px] font-medium text-muted flex-shrink-0">
													{share.user.name
														?.charAt(0)
														?.toUpperCase() ?? "?"}
												</div>
											)}
											<div className="min-w-0">
												<p className="text-[13px] font-medium text-foreground truncate">
													@{share.user.githubUsername}
													{isOwner && (
														<span className="text-muted/50 font-normal">
															{" "}
															(you)
														</span>
													)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3 flex-shrink-0 ml-3">
											<span className="text-[11px] font-mono text-muted capitalize">
												{isOwner ? "Owner" : share.role}
											</span>
											{!isOwner && (
												<button
													onClick={() => setRevokeTarget(share)}
													className="px-2.5 py-1 text-[11px] font-medium text-muted border border-border rounded-md hover:text-red-400 hover:border-red-400/30 transition-colors"
												>
													Revoke
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>

						{/* Search to add */}
						<div className="px-5 py-4 border-t border-border">
							<UserSearch
								onSelect={handleShare}
								placeholder="Search GitHub username to share..."
								excludeUserIds={existingUserIds}
								actionLabel="Share"
							/>
							{isSharing && (
								<p className="text-[12px] text-muted mt-2">
									Sharing...
								</p>
							)}
							{shareError && (
								<p className="text-[12px] text-red-400 mt-2">
									{shareError}
								</p>
							)}
						</div>

						{/* Usage */}
						<div className="px-5 py-3 border-t border-border bg-surface-hover/50">
							<p className="text-[12px] text-muted">
								<span className="font-mono text-foreground">
									{data.shareCount}
								</span>{" "}
								/{" "}
								<span className="font-mono">{data.shareLimit}</span> share
								slots used{" "}
								<span className="text-muted/50">(free tier)</span>
							</p>
						</div>
					</div>
				</section>
			)}

			{/* Details section */}
			<section className="mb-8">
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					<div className="px-5 py-4 border-b border-border">
						<h2 className="text-[14px] font-semibold text-foreground">
							Details
						</h2>
					</div>
					<div className="px-5 py-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-[13px] text-muted">Source</span>
							<span className="text-[13px] text-foreground capitalize">
								{data.skill.sourceType === "direct"
									? "Direct upload"
									: data.skill.sourceType === "github"
										? "Synced from GitHub"
										: data.skill.sourceType}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[13px] text-muted">Last updated</span>
							<span className="text-[13px] text-foreground">
								{formatDate(data.skill.updatedAt)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[13px] text-muted">Downloads</span>
							<span className="text-[13px] font-mono text-foreground">
								{data.skill.downloads}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[13px] text-muted">Files</span>
							<span className="text-[13px] font-mono text-muted">
								SKILL.md, scripts/deploy.sh
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-[13px] text-muted">Security</span>
							<span className="text-[13px] text-emerald-400">
								Clean (scanned {formatDate(data.skill.updatedAt)})
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Revoke confirmation */}
			{revokeTarget && (
				<ConfirmationDialog
					title="Revoke access?"
					message={`Remove @${revokeTarget.user.githubUsername}'s access to "${data.skill.name}"? They will no longer be able to search or install this skill.`}
					confirmLabel="Remove"
					onConfirm={handleRevoke}
					onCancel={() => setRevokeTarget(null)}
					isLoading={isRevoking}
				/>
			)}
		</div>
	);
}
