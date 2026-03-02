import { useState } from "react";
import { Navbar } from "~/components/navbar";
import { useReveal } from "~/components/use-reveal";

/* ─── Mock data ─── */
const FEATURED_SKILLS = [
	{
		slug: "frontend-design",
		name: "frontend-design",
		description:
			"Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code that avoids generic AI aesthetics.",
		publisher: "anthropic",
		categories: ["frontend", "design"],
		downloads: 112800,
	},
	{
		slug: "vercel-react-best-practices",
		name: "react-best-practices",
		description:
			"Enforces React best practices including proper hook usage, component patterns, performance optimizations, and modern concurrent features.",
		publisher: "vercel-labs",
		categories: ["frontend", "react"],
		downloads: 181000,
	},
	{
		slug: "audit-website",
		name: "audit-website",
		description:
			"Run comprehensive Lighthouse audits on any URL. Measures performance, accessibility, SEO, and best practices with actionable recommendations.",
		publisher: "anthropic",
		categories: ["devops", "testing"],
		downloads: 94200,
	},
	{
		slug: "azure-deploy",
		name: "azure-deploy",
		description:
			"Deploy applications to Azure with best practices. Handles App Service, Functions, Container Apps, and AKS with proper configuration.",
		publisher: "microsoft",
		categories: ["cloud", "deployment"],
		downloads: 93700,
	},
	{
		slug: "remotion-best-practices",
		name: "remotion-best-practices",
		description:
			"Build programmatic videos with Remotion. Covers composition setup, animation timing, audio sync, and rendering optimizations.",
		publisher: "remotion-dev",
		categories: ["media", "react"],
		downloads: 119500,
	},
	{
		slug: "web-design-guidelines",
		name: "web-design-guidelines",
		description:
			"Professional web design standards covering layout systems, typography scales, color theory, responsive patterns, and accessibility compliance.",
		publisher: "vercel-labs",
		categories: ["frontend", "design"],
		downloads: 139400,
	},
];

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
		comingSoon: true,
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
		title: "Multi-layer security scanning",
		comingSoon: true,
		description:
			"Every skill is scanned for prompt injection, malicious code, and suspicious behavior before publishing. Community reporting adds another safety net.",
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
		a: "Agent skills are reusable instructions (SKILL.md files) that extend what AI coding assistants can do. They give your agent procedural knowledge — how to audit a website, set up a database, follow design patterns, and more.",
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
		a: "Every skill goes through automated security scanning for prompt injection, malicious code, and suspicious behavior before publishing. Publishers have trust tiers (Verified, Established, New) and the community can report concerns. You can always review skill source code before installing.",
	},
	{
		q: "Is SkillsGate free?",
		a: "Searching, browsing, and installing public skills is completely free.",
	},
];

function formatDownloads(n: number): string {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return String(n);
}

export default function Home() {
	const containerRef = useReveal();

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
						15,000+ skills indexed and semantic-searchable — your AI agent
						finds exactly what it needs. Works with Claude Code, Cursor,
						Windsurf, and more.
					</p>

					{/* Search bar */}
					<div
						className="animate-fade-up mt-10 md:mt-12 max-w-lg mx-auto"
						style={{ animationDelay: "0.5s" }}
					>
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
					</div>

					{/* Quick install hint */}
					<div
						className="animate-fade-up mt-6 flex items-center justify-center gap-4"
						style={{ animationDelay: "0.6s" }}
					>
						<code className="text-[12px] font-mono text-muted bg-code-bg px-3 py-1.5 rounded-md border border-border">
							$ npx skillsgate search "seo audit"
						</code>
					</div>

					{/* Stats row */}
					<div
						className="animate-fade-up mt-12 flex items-center justify-center gap-12 md:gap-16"
						style={{ animationDelay: "0.7s" }}
					>
						<div className="text-center">
							<div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
								15,000+
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

			{/* ═══ FEATURED SKILLS ═══ */}
			<section id="skills" className="py-20 md:py-28 border-t border-border">
				<div className="max-w-6xl mx-auto px-6">
					<div className="reveal flex items-end justify-between mb-12 md:mb-16">
						<div>
							<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
								Featured
							</p>
							<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
								Popular skills
							</h2>
						</div>
						<a
							href="#"
							className="hidden sm:inline-flex text-[13px] text-muted hover:text-foreground transition-colors items-center gap-1.5"
						>
							View all
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
								<line x1="5" y1="12" x2="19" y2="12" />
								<polyline points="12 5 19 12 12 19" />
							</svg>
						</a>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{FEATURED_SKILLS.map((skill, i) => (
							<div
								key={skill.slug}
								className="reveal group relative bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300"
								style={{ transitionDelay: `${i * 60}ms` }}
							>
								{/* Header */}
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 rounded-full bg-accent/40" />
										<span className="text-[11px] font-mono text-muted tracking-wide">
											SKILL.md
										</span>
									</div>
									<span className="text-[11px] font-mono text-muted">
										{formatDownloads(skill.downloads)}
									</span>
								</div>

								{/* Name */}
								<h3 className="text-[15px] font-semibold text-foreground mb-2 group-hover:text-foreground/90">
									{skill.name}
								</h3>

								{/* Publisher */}
								<p className="text-[12px] font-mono text-accent mb-3">
									from "{skill.publisher}"
								</p>

								{/* Description */}
								<p className="text-[13px] text-muted leading-relaxed line-clamp-3">
									{skill.description}
								</p>

								{/* Categories */}
								<div className="flex gap-2 mt-4">
									{skill.categories.map((cat) => (
										<span
											key={cat}
											className="text-[10px] font-mono tracking-wider uppercase text-muted/60 bg-surface-hover px-2 py-0.5 rounded"
										>
											{cat}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
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
								<a href="#" className="block text-[13px] text-muted hover:text-foreground transition-colors">CLI docs</a>
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
