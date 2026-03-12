import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import { Navbar } from "~/components/navbar";
import { publicApi } from "~/lib/api";
import { marked } from "marked";

// ─── Types ──────────────────────────────────────────────────────────

type SkillDetail = {
	skillId: string;
	slug: string;
	name: string;
	description: string;
	summary: string;
	categories: string[];
	capabilities: string[];
	keywords: string[];
	githubUrl: string;
	githubRepo: string;
	installCommand: string | null;
	createdAt: string;
	updatedAt: string;
};

type SkillDetailResponse = {
	skill: SkillDetail;
	content: string;
};

// ─── Configure marked ───────────────────────────────────────────────

marked.setOptions({
	gfm: true,
	breaks: true,
});

// ─── Page Component ─────────────────────────────────────────────────

export default function SkillDetailPage() {
	const { slug } = useParams();
	const [skill, setSkill] = useState<SkillDetail | null>(null);
	const [content, setContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!slug) return;

		setIsLoading(true);
		setError(null);

		publicApi
			.get<SkillDetailResponse>(`/api/v1/skills/${encodeURIComponent(slug)}`)
			.then((res) => {
				if (res.ok) {
					setSkill(res.data.skill);
					setContent(res.data.content);
				} else if (res.status === 404) {
					setError("Skill not found");
				} else {
					setError(res.error || "Failed to load skill");
				}
			})
			.catch(() => {
				setError("Failed to load skill");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [slug]);

	const renderedHtml = useMemo(() => {
		if (!content) return "";
		try {
			return marked(content) as string;
		} catch {
			return "";
		}
	}, [content]);

	async function handleCopy() {
		if (!skill?.installCommand) return;
		await navigator.clipboard.writeText(skill.installCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	// Extract owner from githubRepo for avatar
	const owner = skill?.githubRepo
		? skill.githubRepo.split("/")[0]
		: null;

	const repoName = skill?.githubRepo
		? skill.githubRepo.split("/").slice(1).join("/")
		: null;

	// ─── Loading state ────────────────────────────────────────────────

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
					{/* Back link skeleton */}
					<div className="h-4 w-28 bg-surface-hover rounded animate-pulse mb-10" />

					<div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
						{/* Main content skeleton */}
						<div className="flex-1 min-w-0">
							<div className="h-8 w-72 bg-surface-hover rounded animate-pulse mb-4" />
							<div className="h-4 w-full bg-surface-hover rounded animate-pulse mb-2" />
							<div className="h-4 w-4/5 bg-surface-hover rounded animate-pulse mb-8" />

							<div className="space-y-3">
								{Array.from({ length: 12 }).map((_, i) => (
									<div
										key={i}
										className="h-3 bg-surface-hover rounded animate-pulse"
										style={{ width: `${60 + Math.random() * 40}%` }}
									/>
								))}
							</div>
						</div>

						{/* Sidebar skeleton */}
						<div className="w-full lg:w-80 flex-shrink-0 space-y-6">
							<div className="bg-card-bg border border-card-border rounded-xl p-5">
								<div className="h-10 bg-surface-hover rounded animate-pulse mb-4" />
								<div className="h-10 bg-surface-hover rounded animate-pulse mb-4" />
								<div className="space-y-2">
									<div className="h-3 w-20 bg-surface-hover rounded animate-pulse" />
									<div className="flex gap-2">
										<div className="h-5 w-16 bg-surface-hover rounded animate-pulse" />
										<div className="h-5 w-16 bg-surface-hover rounded animate-pulse" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ─── Error state ──────────────────────────────────────────────────

	if (error || !skill) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<div className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
					<div className="text-6xl font-semibold text-muted/20 mb-4">404</div>
					<h1 className="text-xl font-semibold text-foreground mb-3">
						{error || "Skill not found"}
					</h1>
					<p className="text-[14px] text-muted mb-8">
						The skill you are looking for does not exist or is not publicly available.
					</p>
					<Link
						to="/#skills"
						className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-foreground border border-border rounded-lg hover:border-accent/40 transition-colors no-underline"
					>
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
							<line x1="19" y1="12" x2="5" y2="12" />
							<polyline points="12 19 5 12 12 5" />
						</svg>
						Back to skills
					</Link>
				</div>
			</div>
		);
	}

	// ─── Skill detail ─────────────────────────────────────────────────

	return (
		<div className="min-h-screen">
			<Navbar />

			<div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
				{/* Back link */}
				<Link
					to="/#skills"
					className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-foreground transition-colors mb-10 no-underline"
				>
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
						<line x1="19" y1="12" x2="5" y2="12" />
						<polyline points="12 19 5 12 12 5" />
					</svg>
					Back to skills
				</Link>

				<div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
					{/* ─── Main content ──────────────────────────────────── */}
					<div className="flex-1 min-w-0">
						{/* Skill header */}
						<div className="mb-8">
							<div className="flex items-center gap-2.5 mb-3">
								<div className="w-2 h-2 rounded-full bg-accent/40" />
								<span className="text-[11px] font-mono text-muted tracking-wide">
									SKILL.md
								</span>
							</div>
							<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">
								{skill.name}
							</h1>
							{skill.summary && (
								<p className="text-[15px] text-muted leading-relaxed max-w-2xl">
									{skill.summary}
								</p>
							)}
						</div>

						{/* Rendered markdown content */}
						{renderedHtml ? (
							<div
								className="skill-prose"
								dangerouslySetInnerHTML={{ __html: renderedHtml }}
							/>
						) : (
							<div className="py-12 text-center">
								<p className="text-[14px] text-muted/60">
									No content available for this skill.
								</p>
								{skill.githubUrl && (
									<a
										href={skill.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 mt-4 text-[13px] text-accent hover:text-foreground transition-colors"
									>
										View source on GitHub
										<svg
											width="12"
											height="12"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
											<polyline points="15 3 21 3 21 9" />
											<line x1="10" y1="14" x2="21" y2="3" />
										</svg>
									</a>
								)}
							</div>
						)}
					</div>

					{/* ─── Sidebar ───────────────────────────────────────── */}
					<aside className="w-full lg:w-80 flex-shrink-0">
						<div className="lg:sticky lg:top-24 space-y-5">
							{/* Install command */}
							{skill.installCommand && (
								<div className="bg-card-bg border border-card-border rounded-xl p-5">
									<p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted mb-3">
										Install
									</p>
									<div className="flex items-center gap-2">
										<code className="flex-1 text-[12px] font-mono text-muted bg-code-bg px-3 py-2 rounded-md border border-border overflow-x-auto">
											$ {skill.installCommand}
										</code>
										<button
											onClick={handleCopy}
											className="flex-shrink-0 p-2 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
											title="Copy install command"
										>
											{copied ? (
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
													<polyline points="20 6 9 17 4 12" />
												</svg>
											) : (
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
													<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
													<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
												</svg>
											)}
										</button>
									</div>
								</div>
							)}

							{/* Author / Publisher */}
							{owner && (
								<div className="bg-card-bg border border-card-border rounded-xl p-5">
									<p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted mb-3">
										Publisher
									</p>
									<a
										href={`https://github.com/${owner}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-3 group no-underline"
									>
										<img
											src={`https://github.com/${owner}.png?size=40`}
											alt={owner}
											width={32}
											height={32}
											className="rounded-full bg-surface-hover"
										/>
										<span className="text-[14px] font-medium text-foreground group-hover:text-accent transition-colors">
											{owner}
										</span>
									</a>
									{repoName && (
										<p className="mt-2 text-[12px] font-mono text-muted/60 truncate">
											{skill.githubRepo}
										</p>
									)}
								</div>
							)}

							{/* View on GitHub */}
							{skill.githubUrl && (
								<a
									href={skill.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-foreground border border-border rounded-lg hover:border-accent/40 transition-colors no-underline"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
									View on GitHub
								</a>
							)}

							{/* Categories */}
							{skill.categories.length > 0 && (
								<div className="bg-card-bg border border-card-border rounded-xl p-5">
									<p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted mb-3">
										Categories
									</p>
									<div className="flex flex-wrap gap-2">
										{skill.categories.map((cat) => (
											<span
												key={cat}
												className="text-[11px] font-mono tracking-wider uppercase text-muted bg-surface-hover px-2.5 py-1 rounded"
											>
												{cat}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Capabilities */}
							{skill.capabilities.length > 0 && (
								<div className="bg-card-bg border border-card-border rounded-xl p-5">
									<p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted mb-3">
										Capabilities
									</p>
									<ul className="space-y-1.5">
										{skill.capabilities.map((cap) => (
											<li
												key={cap}
												className="flex items-start gap-2 text-[13px] text-muted"
											>
												<span className="text-accent/60 mt-0.5 flex-shrink-0">
													&bull;
												</span>
												{cap}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Keywords */}
							{skill.keywords.length > 0 && (
								<div className="bg-card-bg border border-card-border rounded-xl p-5">
									<p className="text-[11px] font-mono tracking-[0.15em] uppercase text-muted mb-3">
										Keywords
									</p>
									<div className="flex flex-wrap gap-1.5">
										{skill.keywords.map((kw) => (
											<span
												key={kw}
												className="text-[10px] font-mono text-muted/50 bg-surface-hover px-2 py-0.5 rounded"
											>
												{kw}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Created date */}
							<div className="px-1">
								<p className="text-[11px] font-mono text-muted/40">
									Added{" "}
									{new Date(skill.createdAt).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
