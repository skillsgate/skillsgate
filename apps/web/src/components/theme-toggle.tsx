import { useState, useEffect } from "react";

export function ThemeToggle() {
	const [dark, setDark] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme");
		if (stored === "light") {
			setDark(false);
			document.documentElement.classList.remove("dark");
		} else {
			setDark(true);
			document.documentElement.classList.add("dark");
		}
	}, []);

	function toggle() {
		const html = document.documentElement;
		html.classList.add("transitioning");
		const next = !dark;
		setDark(next);
		if (next) {
			html.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			html.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
		setTimeout(() => html.classList.remove("transitioning"), 350);
	}

	if (!mounted) return <div className="w-8 h-8" />;

	return (
		<button
			onClick={toggle}
			className="relative w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-foreground transition-colors"
			aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
		>
			{dark ? (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="5" />
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</svg>
			) : (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			)}
		</button>
	);
}
