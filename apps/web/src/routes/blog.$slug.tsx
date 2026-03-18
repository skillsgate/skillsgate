import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { Navbar } from "~/components/navbar";
import { publicApi } from "~/lib/api";
import { marked } from "marked";

// ─── Types ──────────────────────────────────────────────────────────

type BlogPost = {
	id: string;
	slug: string;
	title: string;
	description: string;
	content: string;
	author: string;
	coverImage: string | null;
	tags: string[];
	publishedAt: string;
	createdAt: string;
	updatedAt: string;
};

type BlogPostResponse = {
	post: BlogPost;
};

type BlogPostMeta = {
	title: string;
	description: string;
	coverImage: string | null;
	author: string;
	slug: string;
	publishedAt: string;
};

// ─── Loader (server-side for SEO meta) ──────────────────────────────

export async function loader({ params }: LoaderFunctionArgs) {
	const slug = params.slug;
	if (!slug) return { post: null };

	try {
		const res = await publicApi.get<BlogPostResponse>(
			`/api/blog/${encodeURIComponent(slug)}`
		);
		if (res.ok) {
			const { title, description, coverImage, author, slug: postSlug, publishedAt } = res.data.post;
			return {
				post: { title, description, coverImage, author, slug: postSlug, publishedAt } as BlogPostMeta,
			};
		}
	} catch {
		// fall through
	}
	return { post: null };
}

// ─── Meta (uses loader data for SEO) ────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const post = data?.post;
	if (!post) {
		return [
			{ title: "Blog Post — SkillsGate" },
			{ name: "description", content: "Read the latest from the SkillsGate team." },
		];
	}

	const tags = [
		{ title: `${post.title} — SkillsGate Blog` },
		{ name: "description", content: post.description },
		{ property: "og:title", content: post.title },
		{ property: "og:description", content: post.description },
		{ property: "og:url", content: `https://skillsgate.ai/blog/${post.slug}` },
		{ property: "og:type", content: "article" },
		{ property: "og:site_name", content: "SkillsGate" },
		{ property: "article:published_time", content: post.publishedAt },
		{ property: "article:author", content: post.author },
		{ name: "twitter:title", content: post.title },
		{ name: "twitter:description", content: post.description },
	];

	if (post.coverImage) {
		tags.push(
			{ property: "og:image", content: post.coverImage },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:image", content: post.coverImage },
		);
	} else {
		tags.push({ name: "twitter:card", content: "summary" });
	}

	return tags;
};

// ─── Configure marked ───────────────────────────────────────────────

marked.setOptions({
	gfm: true,
	breaks: true,
});

// ─── HTML sanitizer ─────────────────────────────────────────────────

function sanitizeHtml(html: string): string {
	let clean = html.replace(
		/<(script|iframe|object|embed|form|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
		""
	);
	clean = clean.replace(/<(script|iframe|object|embed|link)\b[^>]*\/?>/gi, "");
	clean = clean.replace(
		/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
		""
	);
	clean = clean.replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="');
	return clean;
}

// ─── Page Component ─────────────────────────────────────────────────

export default function BlogPostPage() {
	const params = useParams();
	const slug = params.slug;
	const [post, setPost] = useState<BlogPost | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!slug) return;

		setIsLoading(true);
		setError(null);

		publicApi
			.get<BlogPostResponse>(`/api/blog/${encodeURIComponent(slug)}`)
			.then((res) => {
				if (res.ok) {
					setPost(res.data.post);
				} else if (res.status === 404) {
					setError("Post not found");
				} else {
					setError(res.error || "Failed to load post");
				}
			})
			.catch(() => {
				setError("Failed to load post");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [slug]);

	const renderedHtml = useMemo(() => {
		if (!post?.content) return "";
		try {
			return sanitizeHtml(marked(post.content) as string);
		} catch {
			return "";
		}
	}, [post?.content]);

	// ─── Loading state ────────────────────────────────────────────────

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
					<div className="h-4 w-20 bg-surface-hover rounded animate-pulse mb-10" />
					<div className="h-8 w-96 bg-surface-hover rounded animate-pulse mb-4" />
					<div className="h-4 w-48 bg-surface-hover rounded animate-pulse mb-8" />
					<div className="space-y-3">
						{Array.from({ length: 10 }).map((_, i) => (
							<div
								key={i}
								className="h-3 bg-surface-hover rounded animate-pulse"
								style={{ width: `${60 + Math.random() * 40}%` }}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	// ─── Error state ──────────────────────────────────────────────────

	if (error || !post) {
		return (
			<div className="min-h-screen">
				<Navbar />
				<div className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
					<div className="text-6xl font-semibold text-muted/20 mb-4">404</div>
					<h1 className="text-xl font-semibold text-foreground mb-3">
						{error || "Post not found"}
					</h1>
					<p className="text-[14px] text-muted mb-8">
						The blog post you are looking for does not exist.
					</p>
					<Link
						to="/blog"
						className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-foreground border border-border rounded-lg hover:border-accent/40 transition-colors no-underline"
					>
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
							<line x1="19" y1="12" x2="5" y2="12" />
							<polyline points="12 19 5 12 12 5" />
						</svg>
						Back to blog
					</Link>
				</div>
			</div>
		);
	}

	// ─── Post detail ──────────────────────────────────────────────────

	return (
		<div className="min-h-screen">
			<Navbar />

			<div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
				{/* Back link */}
				<Link
					to="/blog"
					className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-foreground transition-colors mb-10 no-underline"
				>
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
						<line x1="19" y1="12" x2="5" y2="12" />
						<polyline points="12 19 5 12 12 5" />
					</svg>
					Back to blog
				</Link>

				{/* Post header */}
				<header className="mb-10">
					<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-4">
						{post.title}
					</h1>
					<div className="flex items-center gap-4 text-[13px] text-muted mb-4">
						<span>{post.author}</span>
						<span>&middot;</span>
						<time>
							{new Date(post.publishedAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</time>
					</div>
					{post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="text-[11px] font-mono tracking-wider uppercase text-muted bg-surface-hover px-2.5 py-1 rounded"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</header>

				{/* Cover image */}
				{post.coverImage && (
					<div className="mb-10 rounded-xl overflow-hidden border border-card-border">
						<img
							src={post.coverImage}
							alt={post.title}
							className="w-full"
						/>
					</div>
				)}

				{/* Rendered markdown content */}
				{renderedHtml ? (
					<div
						className="skill-prose"
						dangerouslySetInnerHTML={{ __html: renderedHtml }}
					/>
				) : (
					<div className="py-12 text-center">
						<p className="text-[14px] text-muted/60">
							No content available.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
