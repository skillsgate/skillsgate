import { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";
import { Navbar } from "~/components/navbar";
import { publicApi } from "~/lib/api";

export const meta: MetaFunction = () => [
	{ title: "Blog — SkillsGate" },
	{
		name: "description",
		content:
			"Announcements, tutorials, and insights from the SkillsGate team.",
	},
	{ property: "og:title", content: "Blog — SkillsGate" },
	{
		property: "og:description",
		content:
			"Announcements, tutorials, and insights from the SkillsGate team.",
	},
	{ property: "og:url", content: "https://skillsgate.ai/blog" },
	{ property: "og:type", content: "website" },
	{ property: "og:site_name", content: "SkillsGate" },
	{ name: "twitter:card", content: "summary" },
	{ name: "twitter:title", content: "Blog — SkillsGate" },
	{
		name: "twitter:description",
		content:
			"Announcements, tutorials, and insights from the SkillsGate team.",
	},
];

type BlogPostSummary = {
	id: string;
	slug: string;
	title: string;
	description: string;
	author: string;
	coverImage: string | null;
	tags: string[];
	publishedAt: string;
};

type BlogListResponse = {
	posts: BlogPostSummary[];
	meta: { total: number; limit: number; offset: number; hasMore: boolean };
};

export default function BlogListPage() {
	const [posts, setPosts] = useState<BlogPostSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [offset, setOffset] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);
	const limit = 10;

	useEffect(() => {
		setIsLoading(true);
		publicApi
			.get<BlogListResponse>(`/api/blog?limit=${limit}&offset=0`)
			.then((res) => {
				if (res.ok) {
					setPosts(res.data.posts);
					setHasMore(res.data.meta.hasMore);
					setOffset(res.data.posts.length);
				}
			})
			.finally(() => setIsLoading(false));
	}, []);

	async function loadMore() {
		setLoadingMore(true);
		const res = await publicApi.get<BlogListResponse>(
			`/api/blog?limit=${limit}&offset=${offset}`
		);
		if (res.ok) {
			setPosts((prev) => [...prev, ...res.data.posts]);
			setHasMore(res.data.meta.hasMore);
			setOffset((prev) => prev + res.data.posts.length);
		}
		setLoadingMore(false);
	}

	return (
		<div className="min-h-screen">
			<Navbar />

			<div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
						Blog
					</h1>
					<p className="text-[15px] text-muted max-w-xl">
						Announcements, tutorials, and insights from the SkillsGate team.
					</p>
				</div>

				{/* Loading state */}
				{isLoading && (
					<div className="space-y-8">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={i}
								className="bg-card-bg border border-card-border rounded-xl p-6 animate-pulse"
							>
								<div className="h-5 w-48 bg-surface-hover rounded mb-3" />
								<div className="h-4 w-full bg-surface-hover rounded mb-2" />
								<div className="h-4 w-3/4 bg-surface-hover rounded mb-4" />
								<div className="h-3 w-32 bg-surface-hover rounded" />
							</div>
						))}
					</div>
				)}

				{/* Empty state */}
				{!isLoading && posts.length === 0 && (
					<div className="text-center py-20">
						<p className="text-[15px] text-muted">No blog posts yet. Check back soon!</p>
					</div>
				)}

				{/* Posts list */}
				{!isLoading && posts.length > 0 && (
					<div className="space-y-8">
						{posts.map((post) => (
							<a
								key={post.id}
								href={`/blog/${post.slug}`}
								className="group block bg-card-bg border border-card-border rounded-xl overflow-hidden hover:border-accent/30 transition-all duration-300 no-underline"
							>
								{post.coverImage && (
									<div className="aspect-[3/1] overflow-hidden">
										<img
											src={post.coverImage}
											alt={post.title}
											className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
										/>
									</div>
								)}
								<div className="p-6">
									<h2 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
										{post.title}
									</h2>
									<p className="text-[14px] text-muted leading-relaxed mb-4 line-clamp-2">
										{post.description}
									</p>
									<div className="flex items-center gap-4 text-[12px] text-muted/60">
										<span>{post.author}</span>
										<span>&middot;</span>
										<time>
											{new Date(post.publishedAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</time>
									</div>
									{post.tags.length > 0 && (
										<div className="flex flex-wrap gap-1.5 mt-3">
											{post.tags.map((tag) => (
												<span
													key={tag}
													className="text-[10px] font-mono tracking-wider uppercase text-muted/50 bg-surface-hover px-2 py-0.5 rounded"
												>
													{tag}
												</span>
											))}
										</div>
									)}
								</div>
							</a>
						))}
					</div>
				)}

				{/* Load more */}
				{hasMore && (
					<div className="mt-10 text-center">
						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="px-6 py-2.5 text-[13px] font-medium text-foreground border border-border rounded-lg hover:border-accent/40 transition-colors disabled:opacity-50"
						>
							{loadingMore ? "Loading..." : "Load more"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
