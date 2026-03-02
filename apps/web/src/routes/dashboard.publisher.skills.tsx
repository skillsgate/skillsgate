import { useState } from "react";
import { Link } from "react-router";

/* ─── Types matching API contract ─── */

type PublisherSkill = {
	id: string;
	slug: string;
	name: string;
	description: string;
	visibility: "public" | "private" | "premium";
	shareCount: number | null;
	buyerCount: number | null;
	downloads: number;
	createdAt: string;
	updatedAt: string;
};

type PublisherSkillsData = {
	skills: PublisherSkill[];
};

/* ─── Mock data (swap for real API calls) ─── */

function getMockData(): PublisherSkillsData {
	return {
		skills: [
			{
				id: "sk_1",
				slug: "audit-website",
				name: "audit-website",
				description: "Run comprehensive Lighthouse audits on any URL",
				visibility: "public",
				shareCount: null,
				buyerCount: null,
				downloads: 1204,
				createdAt: "2026-01-15T00:00:00Z",
				updatedAt: "2026-02-28T00:00:00Z",
			},
			{
				id: "sk_2",
				slug: "seo-checker",
				name: "seo-checker",
				description: "Check SEO best practices and get actionable recommendations",
				visibility: "public",
				shareCount: null,
				buyerCount: null,
				downloads: 847,
				createdAt: "2026-01-20T00:00:00Z",
				updatedAt: "2026-02-25T00:00:00Z",
			},
			{
				id: "sk_3",
				slug: "deploy-helper",
				name: "deploy-helper",
				description: "Automated deployment helper for CI/CD pipelines",
				visibility: "private",
				shareCount: 3,
				buyerCount: null,
				downloads: 0,
				createdAt: "2026-02-15T00:00:00Z",
				updatedAt: "2026-03-01T00:00:00Z",
			},
			{
				id: "sk_4",
				slug: "my-scratchpad",
				name: "my-scratchpad",
				description: "Personal development scratchpad",
				visibility: "private",
				shareCount: 0,
				buyerCount: null,
				downloads: 0,
				createdAt: "2026-02-20T00:00:00Z",
				updatedAt: "2026-02-28T00:00:00Z",
			},
		],
	};
}

/* ─── Helpers ─── */

function formatDownloads(n: number): string {
	if (n === 0) return "--";
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(n);
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

function getShareInfo(skill: PublisherSkill): string {
	if (skill.visibility === "public") return "--";
	if (skill.visibility === "premium")
		return skill.buyerCount !== null ? `${skill.buyerCount} buyers` : "--";
	if (skill.visibility === "private") {
		if (skill.shareCount === 0) return "just me";
		return `${skill.shareCount} user${skill.shareCount !== 1 ? "s" : ""}`;
	}
	return "--";
}

/* ─── Component ─── */

export default function PublisherSkillsPage() {
	const [data] = useState<PublisherSkillsData>(getMockData);

	const privateSkillCount = data.skills.filter(
		(s) => s.visibility === "private",
	).length;
	const privateSkillLimit = 5;

	return (
		<div>
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Publisher Dashboard
					</h1>
					<p className="text-[14px] text-muted mt-1">
						Manage your published skills.
					</p>
				</div>
				<button className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-foreground bg-surface-hover border border-border rounded-lg hover:border-accent/30 transition-colors">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
					New Skill
				</button>
			</div>

			{/* Skills table */}
			{data.skills.length > 0 ? (
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					{/* Table header */}
					<div className="hidden md:grid grid-cols-[1fr_120px_140px_100px] gap-4 px-5 py-3 border-b border-border">
						<span className="text-[11px] font-mono tracking-wider uppercase text-muted">
							Skill
						</span>
						<span className="text-[11px] font-mono tracking-wider uppercase text-muted">
							Visibility
						</span>
						<span className="text-[11px] font-mono tracking-wider uppercase text-muted">
							Shared with
						</span>
						<span className="text-[11px] font-mono tracking-wider uppercase text-muted text-right">
							Downloads
						</span>
					</div>

					{/* Table rows */}
					<div className="divide-y divide-border">
						{data.skills.map((skill) => (
							<Link
								key={skill.id}
								to={`/dashboard/publisher/skills/${skill.id}`}
								className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px_100px] gap-2 md:gap-4 px-5 py-4 hover:bg-surface-hover transition-colors group"
							>
								<div className="min-w-0">
									<p className="text-[14px] font-medium text-foreground group-hover:text-foreground/90 truncate">
										{skill.name}
									</p>
									<p className="text-[12px] text-muted truncate mt-0.5 md:hidden">
										{getVisibilityBadge(skill.visibility)}
										{" "}
										<span className="text-muted/50">
											{getShareInfo(skill)}
										</span>
									</p>
								</div>
								<div className="hidden md:flex items-center">
									{getVisibilityBadge(skill.visibility)}
								</div>
								<div className="hidden md:flex items-center">
									<span className="text-[13px] text-muted">
										{getShareInfo(skill)}
									</span>
								</div>
								<div className="hidden md:flex items-center justify-end">
									<span className="text-[13px] font-mono text-muted">
										{formatDownloads(skill.downloads)}
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<p className="text-[15px] text-muted mb-2">
						No published skills yet.
					</p>
					<p className="text-[13px] text-muted/70">
						Upload your first skill to get started.
					</p>
				</div>
			)}

			{/* Connected Repos placeholder */}
			<section className="mt-8">
				<h2 className="text-[13px] font-mono tracking-[0.1em] uppercase text-muted mb-4">
					Connected Repos
				</h2>
				<div className="rounded-xl border border-border border-dashed bg-card-bg p-8 text-center">
					<p className="text-[13px] text-muted">
						GitHub repo syncing coming soon.
					</p>
					<p className="text-[12px] text-muted/50 mt-1">
						Connect a GitHub repo to automatically publish skills from your codebase.
					</p>
				</div>
			</section>

			{/* Free tier usage */}
			<div className="mt-8 flex items-center justify-between px-1">
				<p className="text-[12px] text-muted">
					Private Skills:{" "}
					<span className="font-mono text-foreground">
						{privateSkillCount}
					</span>{" "}
					/{" "}
					<span className="font-mono">
						{privateSkillLimit}
					</span>{" "}
					free tier
				</p>
				<span className="text-[12px] text-accent hover:text-foreground transition-colors cursor-pointer">
					Upgrade for unlimited
				</span>
			</div>
		</div>
	);
}
