import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "~/lib/api";

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
	const [data, setData] = useState<PublisherSkillsData>({ skills: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchSkills() {
			const res = await api.get<PublisherSkillsData>(
				"/api/dashboard/publisher/skills",
			);

			if (cancelled) return;

			if (res.ok) {
				setData(res.data);
			} else {
				setError(res.error);
			}
			setLoading(false);
		}

		fetchSkills();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
				<p className="text-[15px] text-red-400 mb-2">
					Failed to load skills.
				</p>
				<p className="text-[13px] text-muted/70">{error}</p>
			</div>
		);
	}

	return (
		<div>
			{/* Header */}
			<div className="flex items-start justify-between mb-8">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">
						Publisher Dashboard
					</h1>
					<p className="text-[14px] text-muted mt-1">
						Manage your published skills.
					</p>
				</div>
				<Link
					to="/dashboard/publisher/skills/new"
					className="px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
				>
					New Skill
				</Link>
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
					<p className="text-[13px] text-muted/70 mb-4">
						Upload your first skill to get started.
					</p>
					<Link
						to="/dashboard/publisher/skills/new"
						className="inline-flex px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors"
					>
						New Skill
					</Link>
				</div>
			)}

			{/* Connected Repos */}
			<section className="mt-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-[13px] font-mono tracking-[0.1em] uppercase text-muted">
						Connected Repos
					</h2>
					<Link
						to="/dashboard/publisher/repos"
						className="text-[13px] text-accent hover:text-accent/80 transition-colors"
					>
						Manage connected repos &rarr;
					</Link>
				</div>
			</section>

		</div>
	);
}
