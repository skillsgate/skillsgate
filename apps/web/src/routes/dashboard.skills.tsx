import { useState, useEffect } from "react";
import { ConfirmationDialog, useApiClient } from "@skillsgate/ui";

/* ─── Types matching API contract ─── */

type SharedSkill = {
	skill: { id: string; slug: string; name: string; description: string };
	sharedBy: { id: string; name: string; githubUsername: string };
	grantedAt: string;
	namespaceId: string;
};

type OrgAccess = {
	org: { id: string; slug: string; name: string; avatarUrl: string | null };
	skillCount: number;
};

type CatalogAccess = {
	namespace: { id: string; name: string };
	skillCount: number;
};

type DashboardSkillsData = {
	shared: SharedSkill[];
	orgs: OrgAccess[];
	catalogs: CatalogAccess[];
};

/* ─── Data fetching ─── */

const EMPTY_DATA: DashboardSkillsData = { shared: [], orgs: [], catalogs: [] };


/* ─── Helper ─── */

function formatRelativeDate(isoDate: string): string {
	const diff = Date.now() - new Date(isoDate).getTime();
	const days = Math.floor(diff / 86400000);
	if (days === 0) return "today";
	if (days === 1) return "1 day ago";
	if (days < 7) return `${days} days ago`;
	const weeks = Math.floor(days / 7);
	if (weeks === 1) return "1 week ago";
	if (weeks < 4) return `${weeks} weeks ago`;
	const months = Math.floor(days / 30);
	if (months === 1) return "1 month ago";
	return `${months} months ago`;
}

/* ─── Component ─── */

export default function DashboardSkillsPage() {
	const api = useApiClient();
	const [data, setData] = useState<DashboardSkillsData>(EMPTY_DATA);
	const [loading, setLoading] = useState(true);
	const [leaveTarget, setLeaveTarget] = useState<SharedSkill | null>(null);
	const [isLeaving, setIsLeaving] = useState(false);

	useEffect(() => {
		async function fetchDashboardSkills(): Promise<DashboardSkillsData> {
			try {
				const res = await api.get<DashboardSkillsData>("/api/dashboard/skills");
				if (!res.ok) return EMPTY_DATA;
				return res.data;
			} catch {
				return EMPTY_DATA;
			}
		}
		fetchDashboardSkills().then((d) => {
			setData(d);
			setLoading(false);
		});
	}, [api]);

	async function handleLeave() {
		if (!leaveTarget) return;
		setIsLeaving(true);

		const res = await api.delete(
			`/api/dashboard/skills/${encodeURIComponent(leaveTarget.namespaceId)}`,
		);

		if (res.ok) {
			setData((prev) => ({
				...prev,
				shared: prev.shared.filter(
					(s) => s.namespaceId !== leaveTarget.namespaceId,
				),
			}));
		}

		setIsLeaving(false);
		setLeaveTarget(null);
	}

	const isEmpty =
		data.shared.length === 0 &&
		data.orgs.length === 0 &&
		data.catalogs.length === 0;

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					My Skills
				</h1>
				<p className="text-[14px] text-muted mt-1">
					Skills you have access to, grouped by how you got access.
				</p>
			</div>

			{isEmpty && (
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-muted mb-2">
						No private skills yet.
					</p>
					<p className="text-[13px] text-muted/70">
						Browse public skills or ask a colleague to share.
					</p>
				</div>
			)}

			{/* Shared with me */}
			{data.shared.length > 0 && (
				<section className="mb-8">
					<h2 className="text-[13px] font-mono tracking-[0.1em] uppercase text-muted mb-4">
						Shared with me
					</h2>
					<div className="rounded-xl border border-card-border bg-card-bg divide-y divide-border overflow-hidden">
						{data.shared.map((item) => (
							<div
								key={item.namespaceId}
								className="flex items-center justify-between px-5 py-4 hover:bg-surface-hover transition-colors"
							>
								<div className="min-w-0">
									<p className="text-[14px] font-medium text-foreground">
										{item.skill.name}
									</p>
									<p className="text-[12px] text-muted mt-0.5">
										Shared by{" "}
										<span className="font-mono text-accent">
											@{item.sharedBy.githubUsername}
										</span>
										{" "}
										<span className="text-muted/50">
											{formatRelativeDate(item.grantedAt)}
										</span>
									</p>
								</div>
								<button
									onClick={() => setLeaveTarget(item)}
									className="flex-shrink-0 ml-4 px-3 py-1.5 text-[12px] font-medium text-muted border border-border rounded-md hover:text-red-400 hover:border-red-400/30 transition-colors"
								>
									Leave
								</button>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Orgs */}
			{data.orgs.length > 0 && (
				<section className="mb-8">
					<h2 className="text-[13px] font-mono tracking-[0.1em] uppercase text-muted mb-4">
						Organizations
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{data.orgs.map((item) => (
							<div
								key={item.org.id}
								className="rounded-xl border border-card-border bg-card-bg p-5 hover:border-accent/30 transition-colors"
							>
								<div className="flex items-center gap-3 mb-3">
									{item.org.avatarUrl ? (
										<img
											src={item.org.avatarUrl}
											alt=""
											className="h-8 w-8 rounded-lg"
										/>
									) : (
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover border border-border text-[12px] font-semibold text-muted">
											{item.org.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div>
										<p className="text-[14px] font-medium text-foreground">
											{item.org.name}
										</p>
										<p className="text-[12px] text-muted">
											{item.skillCount} skill{item.skillCount !== 1 ? "s" : ""} in org
										</p>
									</div>
								</div>
								<a
									href={`/dashboard/publisher/orgs/${item.org.id}`}
									className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground transition-colors"
								>
									View all
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<line x1="5" y1="12" x2="19" y2="12" />
										<polyline points="12 5 19 12 12 19" />
									</svg>
								</a>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Catalogs */}
			{data.catalogs.length > 0 && (
				<section className="mb-8">
					<h2 className="text-[13px] font-mono tracking-[0.1em] uppercase text-muted mb-4">
						Purchased Catalogs
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{data.catalogs.map((item) => (
							<div
								key={item.namespace.id}
								className="rounded-xl border border-card-border bg-card-bg p-5 hover:border-accent/30 transition-colors"
							>
								<div className="mb-3">
									<p className="text-[14px] font-medium text-foreground">
										{item.namespace.name}
									</p>
									<p className="text-[12px] text-muted mt-0.5">
										{item.skillCount} skill{item.skillCount !== 1 ? "s" : ""} in catalog
									</p>
								</div>
								<span className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-foreground transition-colors cursor-pointer">
									View all
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<line x1="5" y1="12" x2="19" y2="12" />
										<polyline points="12 5 19 12 12 19" />
									</svg>
								</span>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Leave confirmation dialog */}
			{leaveTarget && (
				<ConfirmationDialog
					title="Leave shared skill?"
					message={`You will lose access to "${leaveTarget.skill.name}". The owner can re-share it with you later.`}
					confirmLabel="Leave"
					onConfirm={handleLeave}
					onCancel={() => setLeaveTarget(null)}
					isLoading={isLeaving}
				/>
			)}
		</div>
	);
}
