import { Navbar } from "~/components/navbar";
import { useReveal } from "~/components/use-reveal";

const FEATURES = [
	{
		label: "BROWSE",
		title: "Visual skill browser",
		description:
			"See every skill installed across all your agents in one place. Filter by agent, search by name, and preview content before making changes.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="7" height="7" />
				<rect x="14" y="3" width="7" height="7" />
				<rect x="3" y="14" width="7" height="7" />
				<rect x="14" y="14" width="7" height="7" />
			</svg>
		),
	},
	{
		label: "AGENTS",
		title: "Per-agent skill control",
		description:
			"Install a skill to Claude Code but not Cursor. Remove it from Windsurf but keep it in Copilot. Full control over which agents use which skills.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
				<circle cx="9" cy="7" r="4" />
				<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
				<path d="M16 3.13a4 4 0 0 1 0 7.75" />
			</svg>
		),
	},
	{
		label: "EDITOR",
		title: "Built-in markdown editor",
		description:
			"Edit any SKILL.md with a CodeMirror-powered editor. Syntax highlighting, live preview, and save directly to the agent's config directory.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
				<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
			</svg>
		),
	},
	{
		label: "REMOTE",
		title: "Remote server management",
		description:
			"Connect to other machines via SSH. Browse, install, and sync skills on remote servers without leaving the app.",
		icon: (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
				<rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
				<rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
				<line x1="6" y1="6" x2="6.01" y2="6" />
				<line x1="6" y1="18" x2="6.01" y2="18" />
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
	"Roo Code",
	"Zed",
	"Aider",
	"OpenCode",
	"Kilo Code",
	"Trae",
	"VS Code (Copilot Chat)",
	"Claude Desktop",
	"Amazon Q",
];

const FAQ_ITEMS = [
	{
		q: "What are agent skills?",
		a: "Agent skills are reusable instructions (SKILL.md files) that extend what AI coding agents can do. They give your agent procedural knowledge: how to audit a website, set up a database, follow design patterns, and more.",
	},
	{
		q: "Where do the 91k+ skills come from?",
		a: "Public skill discovery is powered by skills.sh, an open index of skills from GitHub. SkillsGate provides the interface to browse, search, and install them to your agents.",
	},
	{
		q: "Which AI agents are supported?",
		a: "SkillsGate supports 18+ agents including Claude Code, Cursor, Windsurf, GitHub Copilot, Codex CLI, Cline, Continue, Amp, Goose, Roo Code, Zed, Aider, and more. Any agent that reads SKILL.md or .cursorrules-style files is compatible.",
	},
	{
		q: "Is SkillsGate free?",
		a: "Yes. The desktop app, browsing, and installing public skills are all free.",
	},
];

export default function Home() {
	const containerRef = useReveal();

	return (
		<div ref={containerRef} className="min-h-screen">
			<Navbar />

			{/* ═══ HERO ═══ */}
			<section className="relative pt-32 pb-20 md:pt-44 md:pb-28 px-6 overflow-hidden">
				{/* Subtle radial glow */}
				<div
					className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-60"
					style={{
						background:
							"radial-gradient(ellipse at center, var(--glow) 0%, transparent 70%)",
					}}
				/>

				<div className="relative max-w-6xl mx-auto">
					<div className="text-center mb-14 md:mb-20">
						<p
							className="animate-fade-up text-[11px] md:text-[12px] font-mono tracking-[0.2em] uppercase text-muted mb-6"
							style={{ animationDelay: "0.1s" }}
						>
							The visual skill manager for AI agents
						</p>
						<h1
							className="animate-fade-up text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-tight text-foreground"
							style={{ animationDelay: "0.2s" }}
						>
							Browse, organize, and
							<br />
							<span className="text-muted">manage agent skills</span>
						</h1>
						<p
							className="animate-fade-up mt-6 md:mt-8 text-[15px] md:text-[17px] leading-relaxed text-muted max-w-xl mx-auto"
							style={{ animationDelay: "0.35s" }}
						>
							91,000+ public skills from{" "}
							<a
								href="https://skills.sh"
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground hover:text-accent transition-colors"
							>
								skills.sh
							</a>
							. 18 supported agents. Install to exactly the
							agents you want. Edit with a built-in markdown editor.
						</p>

						{/* Download buttons */}
						<div
							className="animate-fade-up flex flex-wrap items-center justify-center gap-3 mt-10"
							style={{ animationDelay: "0.5s" }}
						>
							<a
								href="https://github.com/skillsgate/skillsgate/releases/latest"
								className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity no-underline"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								Download Desktop App
							</a>
						</div>

						{/* Stats */}
						<div
							className="animate-fade-up mt-10 flex items-center justify-center gap-12 md:gap-16"
							style={{ animationDelay: "0.6s" }}
						>
							<div className="text-center">
								<div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">91,000+</div>
								<div className="text-[11px] font-mono tracking-wider uppercase text-muted mt-1">Public skills</div>
							</div>
							<div className="w-px h-8 bg-border" />
							<div className="text-center">
								<div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">18</div>
								<div className="text-[11px] font-mono tracking-wider uppercase text-muted mt-1">Agents supported</div>
							</div>
						</div>
					</div>

					{/* Desktop screenshot */}
					<div className="animate-fade-up relative" style={{ animationDelay: "0.7s" }}>
						<div
							className="pointer-events-none absolute -inset-8 opacity-30"
							style={{
								background: "radial-gradient(ellipse at center, var(--glow) 0%, transparent 70%)",
							}}
						/>
						<div className="relative bg-card-bg border border-card-border rounded-xl overflow-hidden shadow-2xl shadow-black/20">
							<div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
								<div className="flex gap-1.5">
									<div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
									<div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
									<div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
								</div>
								<span className="text-[11px] font-mono text-muted/40 ml-2">SkillsGate</span>
							</div>
							<img
								src="/skillsgate-darkmode.png"
								alt="SkillsGate Desktop App"
								className="w-full"
								loading="eager"
							/>
						</div>
					</div>

					{/* Feature cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
						<div className="bg-card-bg border border-card-border rounded-xl p-6">
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">Open source</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								SkillsGate is fully open source. Browse the code, contribute features, and shape the future of agent skill management.
							</p>
						</div>
						<div className="bg-card-bg border border-card-border rounded-xl p-6">
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">Remote servers</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Connect to other machines via SSH to browse and manage skills. Keep your fleet in sync.
							</p>
						</div>
						<div className="bg-card-bg border border-card-border rounded-xl p-6">
							<h3 className="text-[14px] font-semibold text-foreground mb-1.5">Local-first</h3>
							<p className="text-[12px] text-muted leading-relaxed">
								Settings, favorites, and server configs live in a local SQLite database on your machine. No account, no cloud.
							</p>
						</div>
					</div>
				</div>
			</section>


			{/* ═══ AGENT LOGOS ═══ */}
			<section className="py-12 border-t border-border">
				<div className="max-w-5xl mx-auto px-6">
					<p className="reveal text-[11px] font-mono tracking-[0.2em] uppercase text-muted text-center mb-8">
						Works with these agents
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


			{/* ═══ FEATURES ═══ */}
			<section id="features" className="py-20 md:py-28 border-t border-border">
				<div className="max-w-6xl mx-auto px-6">
					<div className="reveal text-center mb-14 md:mb-20">
						<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
							Features
						</p>
						<h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
							Everything you need to
							<br className="hidden sm:block" />
							manage agent skills
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
								desc: "Type what you need. SkillsGate searches 91,000+ public skills and returns the most relevant results.",
							},
							{
								step: "02",
								title: "Preview",
								desc: "Read the full SKILL.md content, check the source repository, and see which agents it supports.",
							},
							{
								step: "03",
								title: "Install",
								desc: "Pick the agents you want it in. SkillsGate writes the skill to the right config directory for each agent.",
							},
							{
								step: "04",
								title: "Edit",
								desc: "Customize any skill with the built-in markdown editor. Your changes stay local to that agent.",
							},
						].map((item) => (
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
									<p className="text-[14px] text-muted leading-relaxed">
										{item.desc}
									</p>
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
							Take control of your
							<br className="hidden sm:block" />
							agent skills
						</h2>
						<p className="mt-5 text-[15px] text-muted max-w-md mx-auto leading-relaxed">
							Browse 91,000+ skills, install to the agents you choose, and edit
							anything with a proper markdown editor.
						</p>

						<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
							<a
								href="https://github.com/skillsgate/skillsgate/releases/latest"
								className="inline-flex items-center justify-center px-6 py-3 text-[14px] font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity no-underline"
							>
								Download Desktop App
							</a>
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
