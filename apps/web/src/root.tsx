import type { LinksFunction, MetaFunction } from "react-router";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import { AuthButton } from "~/components/auth-button";
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
	{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
];

export const meta: MetaFunction = () => [
	{ title: "SkillsGate — The open marketplace for AI agent skills" },
	{
		name: "description",
		content:
			"Discover, publish, and install skills that extend AI coding assistants like Claude Code, Cursor, and Windsurf. The npm for AI skills.",
	},
	{ property: "og:title", content: "SkillsGate" },
	{
		property: "og:description",
		content: "The open marketplace for AI agent skills",
	},
	{ property: "og:url", content: "https://skillsgate.ai" },
	{ property: "og:site_name", content: "SkillsGate" },
	{ property: "og:type", content: "website" },
	{ name: "twitter:card", content: "summary_large_image" },
	{ name: "twitter:title", content: "SkillsGate" },
	{
		name: "twitter:description",
		content: "The open marketplace for AI agent skills",
	},
];

export default function Root() {
	return (
		<html lang="en" className="dark">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="font-sora antialiased">
				<header className="fixed top-0 right-0 z-50 p-4">
					<AuthButton />
				</header>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
