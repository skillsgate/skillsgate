import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
	variable: "--font-sora",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "OpenSkills — The open marketplace for AI agent skills",
	description:
		"Discover, publish, and install skills that extend AI coding assistants like Claude Code, Cursor, and Windsurf. The npm for AI skills.",
	openGraph: {
		title: "OpenSkills",
		description: "The open marketplace for AI agent skills",
		url: "https://openskills.dev",
		siteName: "OpenSkills",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "OpenSkills",
		description: "The open marketplace for AI agent skills",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<head>
				<link rel="icon" href="/favicon.ico" type="image/x-icon" />
			</head>
			<body
				className={`${sora.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
