import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { AuthButton } from "./auth-button";

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled
					? "bg-nav-bg backdrop-blur-xl border-b border-nav-border"
					: "bg-transparent"
			}`}
		>
			<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
				{/* Logo */}
				<a href="/" className="flex items-center gap-2.5 group">
					<span className="text-[17px] font-semibold tracking-tight text-foreground">
						SkillsGate
					</span>
				</a>

				{/* Center nav links */}
				<div className="hidden md:flex items-center gap-8">
					<a
						href="#skills"
						className="text-[13px] tracking-wide uppercase text-muted hover:text-foreground transition-colors"
					>
						Skills
					</a>
					<a
						href="#features"
						className="text-[13px] tracking-wide uppercase text-muted hover:text-foreground transition-colors"
					>
						Features
					</a>
					<a
						href="#faq"
						className="text-[13px] tracking-wide uppercase text-muted hover:text-foreground transition-colors"
					>
						FAQ
					</a>
					<a
						href="https://github.com/skillsgate/skillsgate"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-medium uppercase tracking-wide text-foreground/90 transition-colors hover:border-border hover:text-foreground"
					>
						<svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						Star us
					</a>
				</div>

				{/* Right section */}
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<AuthButton />
				</div>
			</div>
		</nav>
	);
}
