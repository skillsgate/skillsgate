import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "~/components/navbar";
import { SkillSearch } from "~/components/skill-search";
import { useReveal } from "~/components/use-reveal";
import { publicApi } from "~/lib/api";
import { FavoritesProvider, useFavorites } from "~/hooks/use-favorites";
import { FavoriteButton } from "~/components/favorite-button";

type CatalogSkill = {
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
	urlPath: string;
};

type CatalogResponse = {
	skills: CatalogSkill[];
	meta: { total: number; limit: number; offset: number; hasMore: boolean };
};

const FEATURES = [
	{
		label: "SEARCH",
		title: "Semantic search",
		comingSoon: false,
		description:
			"Describe what you need in natural language. Our AI-powered search understands intent, not just keywords, to surface the right skills.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
		),
	},
	{
		label: "INSTALL",
		title: "Universal install via MCP",
		comingSoon: false,
		description:
			"One command installs skills for Claude Code, Cursor, Windsurf, and 15+ other AI agents. Works everywhere the Model Context Protocol is supported.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
		),
	},
	{
		label: "SECURITY",
		title: "AI-powered security scanning",
		comingSoon: false,
		description:
			"Scan any skill before installing. Detect prompt injection, data exfiltration, and malicious code using your own AI agent. Share results with the community to build collective trust.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
			</svg>
		),
	},
	{
		label: "TRUST",
		title: "Publisher trust tiers",
		comingSoon: false,
		description:
			"Verified publishers from known organizations, established developers with track records, and transparent trust signals on every skill.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
		),
	},
];

const AGENTS = [
	"Claude Code",
	"Cursor",
	"Windsurf",
	"GitHub Copilot",
	"Codex CLI",
	"Cline",
	"Continue",
	"Amp",
	"Goose",
];

const FAQ_ITEMS = [
	{
		q: "What are agent skills?",
		a: "Agent skills are reusable instructions (SKILL.md files) that extend what AI coding assistants can do. They give your agent procedural knowledge: how to audit a website, set up a database, follow design patterns, and more.",
	},
	{
		q: "How do I install a skill?",
		a: "Run `npx skillsgate install <skill-name>` in your terminal, or ask your AI agent to \"find a skill for...\" if you have the SkillsGate MCP server configured. Skills are installed locally in your project's .skillsgate/ directory.",
	},
	{
		q: "Which AI tools are supported?",
		a: "SkillsGate works with Claude Code, Cursor, Windsurf, GitHub Copilot, Codex CLI, Cline, Continue, Amp, Goose, and many more. Any tool that supports the SKILL.md format or the Model Context Protocol can use skills from SkillsGate.",
	},
	{
		q: "Are these skills safe to use?",
		a: "Run `skillsgate scan <source>` to analyze any skill before installing. It uses your own AI coding tool (Claude Code, Codex, etc.) to detect prompt injection, malicious code, and suspicious behavior. Scan results are crowd-sourced: after scanning, you can share findings with the community so others benefit too. Publishers also have trust tiers (Verified, Established, New).",
	},
	{
		q: "Is SkillsGate free?",
		a: "Searching, browsing, and installing public skills is completely free.",
	},
];

function useCatalog() {
	const [skills, setSkills] = useState<CatalogSkill[]>([]);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const fetchSkills = useCallback(async (offset: number) => {
		const res = await publicApi.get<CatalogResponse>(
			`/api/v1/skills?limit=24&offset=${offset}`
		);
		if (res.ok) {
			if (offset === 0) {
				setSkills(res.data.skills);
			} else {
				setSkills((prev) => [...prev, ...res.data.skills]);
			}
			setTotal(res.data.meta.total);
			setHasMore(res.data.meta.hasMore);
		}
	}, []);

	useEffect(() => {
		fetchSkills(0).finally(() => setIsLoading(false));
	}, [fetchSkills]);

	const loadMore = useCallback(async () => {
		setIsLoadingMore(true);
		await fetchSkills(skills.length);
		setIsLoadingMore(false);
	}, [fetchSkills, skills.length]);

	return { skills, total, hasMore, isLoading, isLoadingMore, loadMore };
}

function CatalogGrid({ catalog }: { catalog: ReturnType<typeof useCatalog> }) {
	const { checkFavorites } = useFavorites();

	// Batch-check new skill IDs whenever skills change (e.g. after "Load more")
	useEffect(() => {
		if (catalog.skills.length > 0) {
			checkFavorites(catalog.skills.map((s) => s.skillId));
		}
	}, [catalog.skills.length, checkFavorites]);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{catalog.skills.map((skill, i) => {
					const publisher = skill.githubUrl
						? skill.githubUrl.replace("https://github.com/", "").split("/")[0]
						: null;

					return (
						<a
							key={skill.skillId}
							href={`/skills/${skill.urlPath}`}
							className="group relative bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 no-underline"
							style={{ transitionDelay: `${(i % 6) * 60}ms` }}
						>
							{/* Header */}
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-accent/40" />
									<span className="text-[11px] font-mono text-muted tracking-wide">
										SKILL.md
									</span>
								</div>
								<FavoriteButton skillId={skill.skillId} />
							</div>

							{/* Name */}
							<h3 className="text-[15px] font-semibold text-foreground mb-2 group-hover:text-foreground/90">
								{skill.name}
							</h3>

							{/* Publisher */}
							{publisher && (
								<p className="text-[12px] font-mono text-accent mb-3">
									from "{publisher}"
								</p>
							)}

							{/* Description */}
							<p className="text-[13px] text-muted leading-relaxed line-clamp-3">
								{skill.summary || skill.description}
							</p>

							{/* Categories */}
							{skill.categories.length > 0 && (
								<div className="flex flex-wrap gap-2 mt-4">
									{skill.categories.slice(0, 3).map((cat) => (
										<span
											key={cat}
											className="text-[10px] font-mono tracking-wider uppercase text-muted/60 bg-surface-hover px-2 py-0.5 rounded"
										>
											{cat}
										</span>
									))}
								</div>
							)}
						</a>
					);
				})}
			</div>

			{/* Load more button */}
			{catalog.hasMore && (
				<div className="mt-10 text-center">
					<button
						onClick={catalog.loadMore}
						disabled={catalog.isLoadingMore}
						className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium text-muted border border-border rounded-lg hover:text-foreground hover:border-accent/40 transition-colors disabled:opacity-50"
					>
						{catalog.isLoadingMore ? (
							<>
								<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
								Loading...
							</>
						) : (
							"Load more"
						)}
					</button>
				</div>
			)}
		</>
	);
}

export default function Home() {
	const containerRef = useReveal();
	const catalog = useCatalog();

	const initialSkillIds = useMemo(
		() => catalog.skills.map((s) => s.skillId),
		// Only compute on first load
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[catalog.isLoading]
	);

	return (
		<div ref={containerRef} className="min-h-screen">
			<Navbar />

			{/* ═══ HERO ═══ */}
			<section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
				{/* Subtle radial glow */}
				<div
					className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-60"
					style={{
						background:
							"radial-gradient(ellipse at center, var(--glow) 0%, transparent 70%)",
					}}
				/>

				<div className="relative max-w-4xl mx-auto text-center">
					{/* Overline */}
					<p
						className="animate-fade-up text-[11px] md:text-[12px] font-mono tracking-[0.2em] uppercase text-muted mb-6"
						style={{ animationDelay: "0.1s" }}
					>
						The open marketplace for AI agent skills
					</p>

					{/* Headline */}
					<h1
						className="animate-fade-up text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
						style={{ animationDelay: "0.2s" }}
					>
						Find the right skill
						<br />
						<span className="text-muted">for any agent</span>
					</h1>

					{/* Subheadline */}
					<p
						className="animate-fade-up mt-6 md:mt-8 text-[15px] md:text-[17px] leading-relaxed text-muted max-w-xl mx-auto"
						style={{ animationDelay: "0.35s" }}
					>
						80,000+ skills indexed and semantic-searchable. Your AI agent
						finds exactly what it needs. Works with Claude Code, Cursor,
						Windsurf, and more.
					</p>

					{/* Search bar */}
					<div
						className="animate-fade-up mt-10 md:mt-12 max-w-lg mx-auto"
						style={{ animationDelay: "0.5s" }}
					>
						<SkillSearch />
					</div>

					{/* Quick install hint */}
					<div
						className="animate-fade-up mt-6 flex items-center justify-center gap-4"
						style={{ animationDelay: "0.6s" }}
					>
						<code className="text-[12px] font-mono text-muted bg-code-bg px-3 py-1.5 rounded-md border border-border">
							$ npx skillsgate search "react best practices"
						</code>
					</div>

					{/* Stats row */}
					<div
						className="animate-fade-up mt-12 flex items-center justify-center gap-12 md:gap-16"
						style={{ animationDelay: "0.7s" }}
					>
						<div className="text-center">
							<div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
								80,000+
							</div>
							<div className="text-[11px] font-mono tracking-wider uppercase text-muted mt-1">
								Skills indexed
							</div>
						</div>
						<div className="w-px h-8 bg-border" />
						<div className="text-center">
							<div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
								17
							</div>
							<div className="text-[11px] font-mono tracking-wider uppercase text-muted mt-1">
								Agents
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ═══ AGENT LOGOS ═══ */}
			<section className="py-12 border-t border-border">
				<div className="max-w-5xl mx-auto px-6">
					<p className="reveal text-[11px] font-mono tracking-[0.2em] uppercase text-muted text-center mb-8">
						Available for these agents
					</p>
					<div className="reveal flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
						{AGENTS.map((agent) => (
							<span
								key={agent}
								className="text-[13px] text-muted/70 hover:text-foreground transition-colors cursor-default"
							>
								{agent}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ═══ BROWSE SKILLS ═══ */}
			<section id="skills" className="py-20 md:py-28 border-t border-border">
				<div className="max-w-6xl mx-auto px-6">
					<div className="reveal flex items-end justify-between mb-12 md:mb-16">
						<div>
							<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
								Catalog
							</p>
							<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
								Browse skills
								{catalog.total > 0 && (
									<span className="ml-3 text-[14px] font-normal text-muted">
										{catalog.total.toLocaleString()} total
									</span>
								)}
							</h2>
						</div>
					</div>

					{/* Loading skeleton */}
					{catalog.isLoading && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="bg-card-bg border border-card-border rounded-xl p-5 animate-pulse"
								>
									<div className="flex items-start justify-between mb-3">
										<div className="h-3 w-16 bg-surface-hover rounded" />
										<div className="h-3 w-10 bg-surface-hover rounded" />
									</div>
									<div className="h-4 w-32 bg-surface-hover rounded mb-2" />
									<div className="h-3 w-24 bg-surface-hover rounded mb-3" />
									<div className="space-y-1.5">
										<div className="h-3 w-full bg-surface-hover rounded" />
										<div className="h-3 w-4/5 bg-surface-hover rounded" />
									</div>
									<div className="flex gap-2 mt-4">
										<div className="h-4 w-14 bg-surface-hover rounded" />
										<div className="h-4 w-14 bg-surface-hover rounded" />
									</div>
								</div>
							))}
						</div>
					)}

					{/* Real skill cards */}
					{!catalog.isLoading && catalog.skills.length > 0 && (
						<FavoritesProvider initialSkillIds={initialSkillIds}>
							<CatalogGrid catalog={catalog} />
						</FavoritesProvider>
					)}
				</div>
			</section>

			{/* ═══ FEATURES ═══ */}
			<section id="features" className="py-20 md:py-28 border-t border-border">
				<div className="max-w-6xl mx-auto px-6">
					<div className="reveal text-center mb-14 md:mb-20">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							Platform
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
							Built for trust and
							<br className="hidden sm:block" />
							developer experience
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
						{FEATURES.map((feature, i) => (
							<div
								key={feature.title}
								className="reveal bg-card-bg p-8 md:p-10"
								style={{ transitionDelay: `${i * 80}ms` }}
							>
								<div className="flex items-center gap-3 mb-4">
									<span className="text-muted">{feature.icon}</span>
									<span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted">
										{feature.label}
									</span>
									{feature.comingSoon && (
										<span className="text-[9px] font-mono tracking-wider uppercase text-accent bg-surface-hover px-2 py-0.5 rounded-full">
											Coming soon
										</span>
									)}
								</div>
								<h3 className="text-[17px] font-semibold text-foreground mb-3">
									{feature.title}
								</h3>
								<p className="text-[14px] text-muted leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══ HOW IT WORKS ═══ */}
			<section className="py-20 md:py-28 border-t border-border">
				<div className="max-w-4xl mx-auto px-6">
					<div className="reveal text-center mb-14 md:mb-20">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							How it works
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
							From search to install
							<br className="hidden sm:block" />
							in seconds
						</h2>
					</div>

					<div className="reveal space-y-0">
						{[
							{
								step: "01",
								title: "Search",
								desc: 'Describe what you need: "help me write better React tests" or "audit my website for SEO issues"',
								code: '$ npx skillsgate search "react testing"',
							},
							{
								step: "02",
								title: "Discover",
								desc: "Semantic search surfaces the most relevant skills, ranked by quality and community trust.",
								code: null,
							},
							{
								step: "03",
								title: "Install",
								desc: "One command adds the skill to your project. It works with your AI agent immediately.",
								code: "$ npx skillsgate install react-best-practices",
							},
						].map((item, i) => (
							<div
								key={item.step}
								className="flex gap-6 md:gap-10 py-8 border-b border-border last:border-0"
							>
								<span className="text-[13px] font-mono text-muted/40 pt-1 flex-shrink-0">
									{item.step}
								</span>
								<div className="flex-1">
									<h3 className="text-[17px] font-semibold text-foreground mb-2">
										{item.title}
									</h3>
									<p className="text-[14px] text-muted leading-relaxed mb-3">
										{item.desc}
									</p>
									{item.code && (
										<code className="inline-block text-[12px] font-mono text-muted bg-code-bg px-3 py-1.5 rounded-md border border-border">
											{item.code}
										</code>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══ INSTALL / MCP SETUP ═══ */}
			<section className="py-20 md:py-28 border-t border-border">
				<div className="max-w-5xl mx-auto px-6">
					<div className="reveal text-center mb-14 md:mb-20">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							Install
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
							Set up in 30 seconds
						</h2>
						<p className="mt-4 text-[15px] text-muted max-w-lg mx-auto leading-relaxed">
							One global install, one setup command. Your AI agent gets 12 new
							tools to search, install, publish, and scan skills.
						</p>
					</div>

					{/* Terminal mockup */}
					<div className="reveal max-w-2xl mx-auto mb-14">
						<div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
							{/* Terminal header */}
							<div className="flex items-center gap-2 px-4 py-3 border-b border-border">
								<div className="flex gap-1.5">
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
								</div>
								<span className="text-[11px] font-mono text-muted/40 ml-2">Terminal</span>
							</div>
							{/* Terminal body */}
							<div className="p-5 font-mono text-[12px] leading-6 space-y-1">
								<p className="text-muted">$ npm install -g skillsgate</p>
								<p className="text-muted/60 mt-3">✔ Installed skillsgate v0.2.0</p>
								<p className="text-muted mt-4">$ skillsgate setup</p>
								<p className="text-muted/60 mt-3">Detected AI tools:</p>
								<p className="text-foreground">  ✔ Claude Code <span className="text-muted/40">(~/.claude.json)</span></p>
								<p className="text-foreground">  ✔ Cursor <span className="text-muted/40">(~/.cursor/mcp.json)</span></p>
								<p className="text-foreground">  ✔ Windsurf <span className="text-muted/40">(~/.windsurf/mcp.json)</span></p>
								<p className="text-muted/60 mt-3">◆ Auto-configure MCP for these tools? <span className="text-foreground">Yes</span></p>
								<p className="text-muted/60 mt-3">✔ Added SkillsGate MCP to Claude Code</p>
								<p className="text-muted/60">✔ Added SkillsGate MCP to Cursor</p>
								<p className="text-muted/60">✔ Added SkillsGate MCP to Windsurf</p>
								<p className="text-muted/60 mt-3">Done! Your AI agents can now search, install, and manage skills.</p>
							</div>
						</div>
					</div>

					{/* Three feature pills */}
					<div className="reveal grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
							<div className="flex justify-center mb-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
							</div>
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">12 MCP tools</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Search, add, remove, update, sync, publish, scan, and more. All available to your AI agent
							</p>
						</div>
						<div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
							<div className="flex justify-center mb-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
									<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
									<line x1="8" y1="21" x2="16" y2="21" />
									<line x1="12" y1="17" x2="12" y2="21" />
								</svg>
							</div>
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">17+ agents supported</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Claude Code, Cursor, Windsurf, Copilot, Codex CLI, Cline, and many more
							</p>
						</div>
						<div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
							<div className="flex justify-center mb-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
									<polyline points="16 18 22 12 16 6" />
									<polyline points="8 6 2 12 8 18" />
								</svg>
							</div>
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">CLI + MCP in one package</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Use from the terminal or let your AI agent invoke tools directly via the Model Context Protocol
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ═══ SECURITY SCAN ═══ */}
			<section className="py-20 md:py-28 border-t border-border">
				<div className="max-w-5xl mx-auto px-6">
					<div className="reveal text-center mb-14 md:mb-20">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							Security
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
							Scan before you install
						</h2>
						<p className="mt-4 text-[15px] text-muted max-w-lg mx-auto leading-relaxed">
							Skills run on your machine. Use your own AI coding tool to analyze
							them for threats. No server cost, full transparency.
						</p>
					</div>

					{/* Terminal mockup */}
					<div className="reveal max-w-2xl mx-auto mb-14">
						<div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
							{/* Terminal header */}
							<div className="flex items-center gap-2 px-4 py-3 border-b border-border">
								<div className="flex gap-1.5">
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
								</div>
								<span className="text-[11px] font-mono text-muted/40 ml-2">Terminal</span>
							</div>
							{/* Terminal body */}
							<div className="p-5 font-mono text-[12px] leading-6 space-y-1">
								<p className="text-muted">$ skillsgate scan @vercel/v0</p>
								<p className="text-muted/60 mt-3">◆ Select a coding agent to run the scan:</p>
								<p className="text-foreground">● Claude Code <span className="text-muted/40">(recommended - read-only mode)</span></p>
								<p className="text-muted/40">○ Codex CLI</p>
								<p className="text-muted/40">○ Goose</p>
								<p className="text-muted/60 mt-3">ℹ Using Claude Code's default model.</p>
								<p className="text-muted/60">◇ Scanning with Claude Code...</p>
								<p className="text-muted/60 mt-3">Risk: <span className="text-green-500 font-semibold">CLEAN</span></p>
								<p className="text-muted/50 mt-1">No security issues found.</p>
								<p className="text-muted/60 mt-3">◆ Share your scan results with the SkillsGate community?</p>
								<p className="text-foreground">● Yes, share</p>
								<p className="text-muted/60 mt-1">✔ Scan submitted to SkillsGate community.</p>
							</div>
						</div>
					</div>

					{/* Three feature pills */}
					<div className="reveal grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
							<div className="flex justify-center mb-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
								</svg>
							</div>
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">8 threat categories</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Prompt injection, data exfiltration, credential harvesting, malicious commands, and more
							</p>
						</div>
						<div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
							<div className="flex justify-center mb-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
								</svg>
							</div>
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">Crowd-sourced trust</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Share scan results with the community. See what others found before you install
							</p>
						</div>
						<div className="bg-card-bg border border-card-border rounded-xl p-6 text-center">
							<div className="flex justify-center mb-3">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
									<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
									<line x1="8" y1="21" x2="16" y2="21" />
									<line x1="12" y1="17" x2="12" y2="21" />
								</svg>
							</div>
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">5 coding agents supported</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Claude Code, Codex CLI, OpenCode, Goose, and Aider. Use whichever you have installed
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ═══ FAQ ═══ */}
			<section id="faq" className="py-20 md:py-28 border-t border-border">
				<div className="max-w-3xl mx-auto px-6">
					<div className="reveal text-center mb-14 md:mb-20">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							Frequently asked
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
							Everything you need to
							<br className="hidden sm:block" />
							know before you begin
						</h2>
					</div>

					<div className="reveal space-y-0">
						{FAQ_ITEMS.map((item, i) => (
							<details
								key={i}
								className="group border-b border-border"
							>
								<summary className="flex items-center justify-between py-5 cursor-pointer">
									<span className="text-[15px] font-medium text-foreground pr-4">
										{item.q}
									</span>
									<span className="faq-icon text-muted flex-shrink-0">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line x1="12" y1="5" x2="12" y2="19" />
											<line x1="5" y1="12" x2="19" y2="12" />
										</svg>
									</span>
								</summary>
								<div className="pb-5 pr-8">
									<p className="text-[14px] text-muted leading-relaxed">
										{item.a}
									</p>
								</div>
							</details>
						))}
					</div>
				</div>
			</section>

			{/* ═══ CTA ═══ */}
			<section className="py-20 md:py-28 border-t border-border">
				<div className="max-w-3xl mx-auto px-6 text-center">
					<div className="reveal">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							Get started
						</p>
						<h2 className="text-2xl md:text-[2.5rem] font-semibold tracking-tight text-foreground leading-tight">
							Extend your AI agent
							<br className="hidden sm:block" />
							starting today
						</h2>
						<p className="mt-5 text-[15px] text-muted max-w-md mx-auto leading-relaxed">
							Search thousands of skills, install in seconds, and make your AI
							coding assistant dramatically more capable.
						</p>

						<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
							<a
								href="#"
								className="inline-flex items-center justify-center px-6 py-3 text-[14px] font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity"
							>
								Get started
							</a>
							<code className="text-[12px] font-mono text-muted bg-code-bg px-4 py-3 rounded-lg border border-border">
								$ npm install -g skillsgate
							</code>
						</div>
					</div>
				</div>
			</section>

			{/* ═══ FOOTER ═══ */}
			<footer className="border-t border-border py-12 md:py-16">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-2 gap-8 mb-12 max-w-md">
						<div>
							<span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted block mb-4">
								Product
							</span>
							<div className="space-y-2.5">
								<a href="#skills" className="block text-[13px] text-muted hover:text-foreground transition-colors">Skills</a>
								<a href="#features" className="block text-[13px] text-muted hover:text-foreground transition-colors">Features</a>
								<a href="#faq" className="block text-[13px] text-muted hover:text-foreground transition-colors">FAQ</a>
							</div>
						</div>
						<div>
							<span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted block mb-4">
								Developers
							</span>
							<div className="space-y-2.5">
								<a href="https://github.com/skillsgate/skillsgate" target="_blank" rel="noopener noreferrer" className="block text-[13px] text-muted hover:text-foreground transition-colors">GitHub</a>
								<a href="/docs" className="block text-[13px] text-muted hover:text-foreground transition-colors">Docs</a>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border gap-4">
						<span className="text-[12px] text-muted/60">
							&copy; {new Date().getFullYear()} SkillsGate. All rights reserved.
						</span>
						<div className="flex items-center gap-5">
							<a
								href="https://github.com/skillsgate/skillsgate"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted/60 hover:text-foreground transition-colors"
								aria-label="GitHub"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
