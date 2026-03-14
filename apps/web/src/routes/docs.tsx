import { useState, useEffect, useCallback, useRef } from "react";
import type { MetaFunction } from "react-router";
import { Navbar } from "~/components/navbar";

export const meta: MetaFunction = () => [
	{ title: "Docs - SkillsGate" },
	{
		name: "description",
		content:
			"SkillsGate documentation: CLI commands, MCP server setup, publishing skills, and security scanning.",
	},
];

/* ─── Section definitions ─── */
const SECTIONS = [
	{ id: "getting-started", label: "Getting started" },
	{ id: "cli-commands", label: "CLI commands" },
	{ id: "cli-options", label: "CLI options" },
	{ id: "mcp-setup", label: "MCP server setup" },
	{ id: "mcp-tools", label: "MCP tools" },
	{ id: "publishing", label: "Publishing a skill" },
	{ id: "security", label: "Security scanning" },
	{ id: "agents", label: "Supported agents" },
] as const;

/* ─── Copy button for code blocks ─── */
function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const copy = useCallback(() => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [text]);

	return (
		<button
			onClick={copy}
			className="absolute top-3 right-3 p-1.5 rounded-md text-muted/40 hover:text-muted transition-colors"
			aria-label="Copy to clipboard"
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
	);
}

/* ─── Code block component ─── */
function CodeBlock({
	children,
	language,
}: {
	children: string;
	language?: string;
}) {
	return (
		<div className="relative group my-5">
			<div className="bg-code-bg border border-border rounded-lg overflow-hidden">
				{language && (
					<div className="flex items-center justify-between px-4 py-2 border-b border-border">
						<span className="text-[10px] font-mono tracking-wider uppercase text-muted/50">
							{language}
						</span>
					</div>
				)}
				<div className="relative">
					<CopyButton text={children.trim()} />
					<pre className="p-4 overflow-x-auto">
						<code className="text-[13px] font-mono leading-relaxed text-muted">
							{children.trim()}
						</code>
					</pre>
				</div>
			</div>
		</div>
	);
}

/* ─── Section heading with anchor ─── */
function SectionHeading({
	id,
	children,
}: {
	id: string;
	children: React.ReactNode;
}) {
	return (
		<h2
			id={id}
			className="group text-xl md:text-2xl font-semibold tracking-tight text-foreground mt-16 mb-6 scroll-mt-24 flex items-center gap-3"
		>
			{children}
			<a
				href={`#${id}`}
				className="opacity-0 group-hover:opacity-100 transition-opacity text-muted/40 hover:text-muted"
				aria-label={`Link to ${id}`}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</a>
		</h2>
	);
}

/* ─── Sub heading ─── */
function SubHeading({
	id,
	children,
}: {
	id?: string;
	children: React.ReactNode;
}) {
	return (
		<h3
			id={id}
			className="text-[16px] font-semibold text-foreground mt-10 mb-4 scroll-mt-24"
		>
			{children}
		</h3>
	);
}

/* ─── Sidebar navigation ─── */
function Sidebar({
	activeSection,
	onClose,
}: {
	activeSection: string;
	onClose?: () => void;
}) {
	return (
		<nav className="space-y-1">
			<p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted/50 mb-4 px-3">
				Documentation
			</p>
			{SECTIONS.map((section) => (
				<a
					key={section.id}
					href={`#${section.id}`}
					onClick={onClose}
					className={`block px-3 py-2 text-[13px] rounded-md transition-colors ${
						activeSection === section.id
							? "text-foreground bg-surface-hover"
							: "text-muted hover:text-foreground hover:bg-surface-hover/50"
					}`}
				>
					{section.label}
				</a>
			))}
		</nav>
	);
}

/* ─── Mobile sidebar drawer ─── */
function MobileDrawer({
	open,
	onClose,
	activeSection,
}: {
	open: boolean;
	onClose: () => void;
	activeSection: string;
}) {
	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-40 lg:hidden">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				onClick={onClose}
			/>
			{/* Drawer */}
			<div className="absolute top-0 left-0 bottom-0 w-72 bg-background border-r border-border p-6 pt-20 overflow-y-auto animate-slide-in-left">
				<button
					onClick={onClose}
					className="absolute top-5 right-5 p-1.5 text-muted hover:text-foreground transition-colors"
					aria-label="Close menu"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
				<Sidebar activeSection={activeSection} onClose={onClose} />
			</div>
		</div>
	);
}

/* ─── Active section tracking hook ─── */
function useActiveSection() {
	const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				// Find the first section that is intersecting (topmost visible)
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort(
						(a, b) =>
							a.boundingClientRect.top - b.boundingClientRect.top
					);
				if (visible.length > 0) {
					setActiveSection(visible[0].target.id);
				}
			},
			{ rootMargin: "-80px 0px -60% 0px", threshold: 0 }
		);

		SECTIONS.forEach((section) => {
			const el = document.getElementById(section.id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	}, []);

	return activeSection;
}

/* ─── Main docs page ─── */
export default function Docs() {
	const activeSection = useActiveSection();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen">
			<Navbar />

			{/* Mobile menu button */}
			<button
				onClick={() => setMobileMenuOpen(true)}
				className="fixed bottom-6 right-6 z-30 lg:hidden bg-surface border border-border rounded-full p-3 shadow-lg text-muted hover:text-foreground transition-colors"
				aria-label="Open navigation"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>

			{/* Mobile drawer */}
			<MobileDrawer
				open={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
				activeSection={activeSection}
			/>

			<div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
				<div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 xl:grid-cols-[240px_1fr] xl:gap-16">
					{/* Desktop sidebar */}
					<aside className="hidden lg:block">
						<div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)] pb-8">
							<Sidebar activeSection={activeSection} />
						</div>
					</aside>

					{/* Main content */}
					<main className="min-w-0 max-w-3xl">
						{/* Page header */}
						<div className="mb-12">
							<p className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">
								Documentation
							</p>
							<h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
								SkillsGate CLI & MCP
							</h1>
							<p className="mt-4 text-[15px] text-muted leading-relaxed max-w-xl">
								Everything you need to search, install, publish,
								and manage AI agent skills from the command line
								or through your AI coding assistant.
							</p>
						</div>

						{/* ═══ GETTING STARTED ═══ */}
						<SectionHeading id="getting-started">
							Getting started
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-4">
							Install the SkillsGate CLI globally to manage
							skills and auto-configure MCP for your AI tools.
						</p>

						<CodeBlock language="bash">{`# Install globally
npm install -g skillsgate

# Auto-configure MCP for your AI tools
skillsgate setup

# Or use without installing
npx skillsgate search "seo audit"`}</CodeBlock>

						<p className="text-[14px] text-muted leading-relaxed mt-6">
							After installing, run{" "}
							<code className="text-[13px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
								skillsgate setup
							</code>{" "}
							to automatically detect and configure MCP for
							Claude Code, Cursor, Windsurf, and other supported
							AI tools.
						</p>

						{/* ═══ CLI COMMANDS ═══ */}
						<SectionHeading id="cli-commands">
							CLI commands
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-6">
							The CLI provides 13 commands for managing skills.
							All commands accept global flags listed in the{" "}
							<a
								href="#cli-options"
								className="text-foreground/80 underline underline-offset-2 decoration-border hover:decoration-muted transition-colors"
							>
								options section
							</a>
							.
						</p>

						<div className="overflow-x-auto my-6">
							<table className="w-full text-[13px]">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-3 pr-6 font-mono font-medium text-foreground/80 whitespace-nowrap">
											Command
										</th>
										<th className="text-left py-3 font-medium text-foreground/80">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="text-muted">
									{[
										[
											"add <source>",
											"Install skills from SkillsGate (@user/slug), GitHub (owner/repo), or local path",
										],
										[
											"remove [name]",
											"Uninstall skills",
										],
										[
											"list",
											"Show installed skills",
										],
										[
											"update [name]",
											"Check and apply updates",
										],
										[
											"sync",
											"Sync skills from node_modules",
										],
										[
											"search <query>",
											"Search for skills (requires auth)",
										],
										[
											"publish [path]",
											"Publish a skill to SkillsGate",
										],
										[
											"scan <source>",
											"Security-scan skills before installing",
										],
										[
											"login",
											"Authenticate with SkillsGate",
										],
										["logout", "Sign out"],
										[
											"whoami",
											"Show current user",
										],
										[
											"setup",
											"Configure MCP for AI tools",
										],
										[
											"mcp",
											"Run as MCP server (stdio transport)",
										],
									].map(([cmd, desc]) => (
										<tr
											key={cmd}
											className="border-b border-border/50"
										>
											<td className="py-3 pr-6 font-mono text-foreground/70 whitespace-nowrap">
												skillsgate {cmd}
											</td>
											<td className="py-3">{desc}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* ═══ CLI OPTIONS ═══ */}
						<SectionHeading id="cli-options">
							CLI options
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-6">
							Global flags available across commands.
						</p>

						<div className="overflow-x-auto my-6">
							<table className="w-full text-[13px]">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-3 pr-6 font-mono font-medium text-foreground/80 whitespace-nowrap">
											Flag
										</th>
										<th className="text-left py-3 font-medium text-foreground/80">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="text-muted">
									{[
										[
											"-g, --global",
											"Use global scope (~/.agents/skills/)",
										],
										[
											"-y, --yes",
											"Skip confirmation prompts",
										],
										[
											"-a, --agent <id>",
											"Target specific agent(s)",
										],
										[
											"--all",
											"Select all skills/agents",
										],
										[
											"--copy",
											"Use copy mode instead of symlink",
										],
										[
											"-s, --scanner",
											"Force a specific coding agent (scan only)",
										],
										[
											"--timeout <sec>",
											"Agent timeout, default 120 (scan only)",
										],
										[
											"--no-share",
											"Don't share results with community (scan only)",
										],
									].map(([flag, desc]) => (
										<tr
											key={flag}
											className="border-b border-border/50"
										>
											<td className="py-3 pr-6 font-mono text-foreground/70 whitespace-nowrap">
												{flag}
											</td>
											<td className="py-3">{desc}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* ═══ MCP SETUP ═══ */}
						<SectionHeading id="mcp-setup">
							MCP server setup
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-4">
							The fastest way to configure MCP is to run{" "}
							<code className="text-[13px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
								skillsgate setup
							</code>
							, which auto-detects your installed AI tools and
							configures them. You can also set it up manually for
							each tool.
						</p>

						<SubHeading>Claude Code</SubHeading>
						<p className="text-[14px] text-muted leading-relaxed mb-2">
							Add to{" "}
							<code className="text-[13px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
								~/.claude.json
							</code>
						</p>
						<CodeBlock language="json">{`{
  "mcpServers": {
    "skillsgate": {
      "command": "skillsgate",
      "args": ["mcp"]
    }
  }
}`}</CodeBlock>

						<SubHeading>Cursor</SubHeading>
						<p className="text-[14px] text-muted leading-relaxed mb-2">
							Add to{" "}
							<code className="text-[13px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
								~/.cursor/mcp.json
							</code>
						</p>
						<CodeBlock language="json">{`{
  "mcpServers": {
    "skillsgate": {
      "command": "skillsgate",
      "args": ["mcp"]
    }
  }
}`}</CodeBlock>

						<SubHeading>Windsurf</SubHeading>
						<p className="text-[14px] text-muted leading-relaxed mb-2">
							Add to{" "}
							<code className="text-[13px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
								~/.windsurf/mcp.json
							</code>
						</p>
						<CodeBlock language="json">{`{
  "mcpServers": {
    "skillsgate": {
      "command": "skillsgate",
      "args": ["mcp"]
    }
  }
}`}</CodeBlock>

						<div className="mt-8 bg-card-bg border border-card-border rounded-xl p-5">
							<div className="flex items-start gap-3">
								<div className="mt-0.5 text-muted/60">
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<circle cx="12" cy="12" r="10" />
										<line
											x1="12"
											y1="16"
											x2="12"
											y2="12"
										/>
										<line
											x1="12"
											y1="8"
											x2="12.01"
											y2="8"
										/>
									</svg>
								</div>
								<div>
									<p className="text-[13px] font-medium text-foreground mb-1">
										Auto-detect all tools
									</p>
									<p className="text-[13px] text-muted leading-relaxed">
										Run{" "}
										<code className="text-[12px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
											skillsgate setup
										</code>{" "}
										to automatically detect and configure
										all installed AI tools at once.
									</p>
								</div>
							</div>
						</div>

						{/* ═══ MCP TOOLS ═══ */}
						<SectionHeading id="mcp-tools">
							MCP tools reference
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-6">
							When running as an MCP server (
							<code className="text-[13px] font-mono text-foreground/80 bg-code-bg px-1.5 py-0.5 rounded border border-border">
								skillsgate mcp
							</code>
							), 12 tools are available to AI agents.
						</p>

						<div className="overflow-x-auto my-6">
							<table className="w-full text-[13px]">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-3 pr-6 font-mono font-medium text-foreground/80 whitespace-nowrap">
											Tool
										</th>
										<th className="text-left py-3 font-medium text-foreground/80">
											Description
										</th>
									</tr>
								</thead>
								<tbody className="text-muted">
									{[
										[
											"skillsgate_search",
											"Search the SkillsGate registry",
										],
										[
											"skillsgate_add",
											"Install skills from any source",
										],
										[
											"skillsgate_remove",
											"Remove installed skills",
										],
										[
											"skillsgate_list",
											"List installed skills",
										],
										[
											"skillsgate_update",
											"Update skills to latest versions",
										],
										[
											"skillsgate_sync",
											"Sync from node_modules",
										],
										[
											"skillsgate_publish",
											"Publish a skill",
										],
										[
											"skillsgate_publish_init",
											"Generate SKILL.md template",
										],
										[
											"skillsgate_scan",
											"Security scan skills",
										],
										[
											"skillsgate_auth_status",
											"Check authentication",
										],
										[
											"skillsgate_whoami",
											"Current user info",
										],
										[
											"skillsgate_logout",
											"Sign out",
										],
									].map(([tool, desc]) => (
										<tr
											key={tool}
											className="border-b border-border/50"
										>
											<td className="py-3 pr-6 font-mono text-foreground/70 whitespace-nowrap">
												{tool}
											</td>
											<td className="py-3">{desc}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* ═══ PUBLISHING ═══ */}
						<SectionHeading id="publishing">
							Publishing a skill
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-4">
							Publish your own skills to SkillsGate so others can
							discover and install them.
						</p>

						<div className="space-y-6 my-8">
							{[
								{
									step: "01",
									title: "Initialize SKILL.md",
									description:
										"Generate a SKILL.md template in your skill directory with the correct frontmatter structure.",
									code: "skillsgate publish --init",
								},
								{
									step: "02",
									title: "Write your instructions",
									description:
										"Edit the generated SKILL.md with your skill's instructions. Include clear, actionable guidance that an AI agent can follow.",
									code: null,
								},
								{
									step: "03",
									title: "Validate",
									description:
										"Run a dry-run to catch any issues before publishing. This checks name format, file sizes, and frontmatter.",
									code: "skillsgate publish --dry-run",
								},
								{
									step: "04",
									title: "Publish",
									description:
										"Publish the skill to SkillsGate. You'll be prompted to choose visibility (public or private).",
									code: "skillsgate publish",
								},
							].map((item) => (
								<div
									key={item.step}
									className="flex gap-5 md:gap-8"
								>
									<span className="text-[13px] font-mono text-muted/30 pt-0.5 flex-shrink-0 select-none">
										{item.step}
									</span>
									<div className="flex-1 min-w-0">
										<h4 className="text-[14px] font-semibold text-foreground mb-1.5">
											{item.title}
										</h4>
										<p className="text-[13px] text-muted leading-relaxed">
											{item.description}
										</p>
										{item.code && (
											<code className="inline-block mt-3 text-[12px] font-mono text-muted bg-code-bg px-3 py-1.5 rounded-md border border-border">
												$ {item.code}
											</code>
										)}
									</div>
								</div>
							))}
						</div>

						<SubHeading>Validation rules</SubHeading>
						<div className="overflow-x-auto my-6">
							<table className="w-full text-[13px]">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-3 pr-6 font-medium text-foreground/80 whitespace-nowrap">
											Field
										</th>
										<th className="text-left py-3 font-medium text-foreground/80">
											Requirement
										</th>
									</tr>
								</thead>
								<tbody className="text-muted">
									{[
										[
											"Name",
											"1-64 chars, lowercase a-z, 0-9, hyphens. No start/end hyphen. Must match directory name.",
										],
										[
											"Description",
											"1-1024 characters",
										],
										[
											"SKILL.md",
											"Must exist with YAML frontmatter containing name and description",
										],
										[
											"Total size",
											"5 MB maximum",
										],
										[
											"Per file",
											"1 MB maximum",
										],
										[
											"SKILL.md size",
											"500 KB maximum",
										],
									].map(([field, req]) => (
										<tr
											key={field}
											className="border-b border-border/50"
										>
											<td className="py-3 pr-6 font-medium text-foreground/70 whitespace-nowrap">
												{field}
											</td>
											<td className="py-3">{req}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* ═══ SECURITY ═══ */}
						<SectionHeading id="security">
							Security scanning
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-4">
							Scan any skill before installing to detect prompt
							injection, data exfiltration, malicious commands,
							and more. Scans use your own AI coding agent for
							full transparency.
						</p>

						<CodeBlock language="bash">{`# Scan a SkillsGate skill
skillsgate scan @username/skill-name

# Scan a GitHub repo
skillsgate scan owner/repo

# Scan a specific skill in a repo
skillsgate scan owner/repo@skill-name

# Scan a local path
skillsgate scan ./local/skill`}</CodeBlock>

						<SubHeading>How scanning works</SubHeading>
						<p className="text-[14px] text-muted leading-relaxed mb-6">
							The scan command invokes an AI coding agent (Claude
							Code, Codex CLI, or others) in read-only mode to
							analyze the skill for security threats. After
							scanning, you can optionally share your results with
							the community.
						</p>

						{/* Terminal mockup */}
						<div className="my-8 bg-card-bg border border-card-border rounded-xl overflow-hidden">
							<div className="flex items-center gap-2 px-4 py-3 border-b border-border">
								<div className="flex gap-1.5">
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
									<div className="w-2.5 h-2.5 rounded-full bg-muted/20" />
								</div>
								<span className="text-[11px] font-mono text-muted/40 ml-2">
									Terminal
								</span>
							</div>
							<div className="p-5 font-mono text-[12px] leading-6 space-y-1">
								<p className="text-muted">
									$ skillsgate scan @vercel/v0
								</p>
								<p className="text-muted/60 mt-3">
									Select a coding agent to run the scan:
								</p>
								<p className="text-foreground">
									Claude Code{" "}
									<span className="text-muted/40">
										(recommended - read-only mode)
									</span>
								</p>
								<p className="text-muted/60 mt-3">
									Scanning with Claude Code...
								</p>
								<p className="text-muted/60 mt-3">
									Risk:{" "}
									<span className="text-green-500 font-semibold">
										CLEAN
									</span>
								</p>
								<p className="text-muted/50 mt-1">
									No security issues found.
								</p>
								<p className="text-muted/60 mt-3">
									Share your scan results with the SkillsGate
									community?
								</p>
								<p className="text-foreground">Yes, share</p>
								<p className="text-muted/60 mt-1">
									Scan submitted to SkillsGate community.
								</p>
							</div>
						</div>

						<SubHeading>Threat categories</SubHeading>
						<p className="text-[14px] text-muted leading-relaxed mb-4">
							Scans check for 8 categories of threats:
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
							{[
								"Prompt injection",
								"Data exfiltration",
								"Credential harvesting",
								"Malicious commands",
								"Hidden instructions",
								"Obfuscated code",
								"Unauthorized network access",
								"File system manipulation",
							].map((threat) => (
								<div
									key={threat}
									className="flex items-center gap-3 text-[13px] text-muted"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-muted/30 flex-shrink-0" />
									{threat}
								</div>
							))}
						</div>

						{/* ═══ AGENTS ═══ */}
						<SectionHeading id="agents">
							Supported agents
						</SectionHeading>

						<p className="text-[14px] text-muted leading-relaxed mb-6">
							SkillsGate works with any AI coding tool that
							supports the SKILL.md format or the Model Context
							Protocol. Currently 17+ agents are supported.
						</p>

						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
							{[
								"Claude Code",
								"Cursor",
								"Windsurf",
								"GitHub Copilot",
								"Codex CLI",
								"Cline",
								"Continue",
								"Amp",
								"Goose",
								"Junie",
								"Kilo Code",
								"OpenCode",
								"OpenClaw",
								"Pear AI",
								"Roo Code",
								"Trae",
								"Zed",
							].map((agent) => (
								<div
									key={agent}
									className="flex items-center gap-3 px-4 py-3 bg-card-bg border border-card-border rounded-lg text-[13px] text-muted"
								>
									<div className="w-2 h-2 rounded-full bg-accent/30 flex-shrink-0" />
									{agent}
								</div>
							))}
						</div>

						{/* Bottom spacer */}
						<div className="h-20" />
					</main>
				</div>
			</div>
		</div>
	);
}
