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
						className="text-[13px] tracking-wide uppercase text-muted hover:text-foreground transition-colors"
					>
						GitHub
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
