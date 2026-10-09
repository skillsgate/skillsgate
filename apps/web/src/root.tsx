import type { LinksFunction, MetaFunction } from "react-router";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import "./globals.css";

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Sora:wght@100..800&family=Geist+Mono:wght@100..900&display=swap",
	},
	{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export const meta: MetaFunction = () => [
	{ title: "SkillsGate · Desktop app for managing AI agent skills" },
	{
		name: "description",
		content:
			"Free, open-source desktop app to browse, install, edit, and organize AI agent skills across Claude Code, Cursor, Codex, and 20 more tools. macOS, Windows, Linux.",
	},
	{ property: "og:title", content: "SkillsGate" },
	{
		property: "og:description",
		content:
			"Browse, install, and edit AI agent skills across 23 coding tools. Free and open source for macOS, Windows, and Linux.",
	},
	{ property: "og:url", content: "https://skillsgate.ai" },
	{ property: "og:site_name", content: "SkillsGate" },
	{ property: "og:type", content: "website" },
	{ name: "twitter:card", content: "summary_large_image" },
	{ name: "twitter:title", content: "SkillsGate" },
	{
		name: "twitter:description",
		content:
			"Browse, install, and edit AI agent skills across 23 coding tools. Free and open source for macOS, Windows, and Linux.",
	},
];

export default function Root() {
	return (
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				{/* Inline script to prevent flash of wrong theme */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})();`,
					}}
				/>
			</head>
			<body className="font-sans antialiased bg-background text-foreground">
				<Outlet />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
