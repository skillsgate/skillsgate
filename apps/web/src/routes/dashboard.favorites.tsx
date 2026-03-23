import { useState, useEffect, useCallback, useMemo } from "react";
import { ConfirmationDialog, useApiClient, formatStars } from "@skillsgate/ui";

// ─── Types ──────────────────────────────────────────────────────────

type FavoriteSkill = {
	skillId: string;
	slug: string;
	name: string;
	description: string;
	summary: string;
	categories: string[];
	capabilities: string[];
	keywords: string[];
	githubUrl: string;
	githubStars: number | null;
	installCommand: string | null;
	urlPath: string;
	favoritedAt: string;
};

type FavoritesResponse = {
	favorites: FavoriteSkill[];
	meta: { total: number; limit: number; offset: number; hasMore: boolean };
};

// ─── Component ──────────────────────────────────────────────────────

export default function DashboardFavoritesPage() {
	const api = useApiClient();
	const [favorites, setFavorites] = useState<FavoriteSkill[]>([]);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [removeTarget, setRemoveTarget] = useState<FavoriteSkill | null>(null);
	const [isRemoving, setIsRemoving] = useState(false);

	const fetchFavorites = useCallback(async (offset: number) => {
		const res = await api.get<FavoritesResponse>(
			`/api/favorites?limit=24&offset=${offset}`
		);
		if (res.ok) {
			if (offset === 0) {
				setFavorites(res.data.favorites);
			} else {
				setFavorites((prev) => [...prev, ...res.data.favorites]);
			}
			setTotal(res.data.meta.total);
			setHasMore(res.data.meta.hasMore);
		}
	}, [api]);

	useEffect(() => {
		fetchFavorites(0).finally(() => setIsLoading(false));
	}, [fetchFavorites]);

	const loadMore = useCallback(async () => {
		setIsLoadingMore(true);
		await fetchFavorites(favorites.length);
		setIsLoadingMore(false);
	}, [fetchFavorites, favorites.length]);

	async function handleRemove() {
		if (!removeTarget) return;
		setIsRemoving(true);

		const res = await api.delete(
			`/api/favorites/${encodeURIComponent(removeTarget.skillId)}`
		);

		if (res.ok) {
			setFavorites((prev) =>
				prev.filter((f) => f.skillId !== removeTarget.skillId)
			);
			setTotal((prev) => prev - 1);
		}

		setIsRemoving(false);
		setRemoveTarget(null);
	}

	const sorted = useMemo(
		() => [...favorites].sort((a, b) => (b.githubStars ?? 0) - (a.githubStars ?? 0)),
		[favorites]
	);

	// ─── Loading state ────────────────────────────────────────────────

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	// ─── Render ───────────────────────────────────────────────────────

	return (
		<div>
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Favorites
				</h1>
				<p className="text-[14px] text-muted mt-1">
					Skills you have saved for quick access.
					{total > 0 && (
						<span className="ml-2 text-muted/60">
							{total} total
						</span>
					)}
				</p>
			</div>

			{/* Empty state */}
			{favorites.length === 0 && (
				<div className="rounded-xl border border-border bg-card-bg p-12 text-center">
					<div className="flex justify-center mb-4">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-muted/30"
						>
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
						</svg>
					</div>
					<p className="text-[15px] text-muted mb-2">
						No favorites yet.
					</p>
					<p className="text-[13px] text-muted/70">
						Browse skills and star the ones you want to keep.
					</p>
					<a
						href="/#skills"
						className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 text-[13px] font-medium text-foreground border border-border rounded-lg hover:border-accent/40 transition-colors no-underline"
					>
						Browse skills
					</a>
				</div>
			)}

			{/* Grid */}
			{favorites.length > 0 && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{sorted.map((skill, i) => {
							const publisher = skill.githubUrl
								? skill.githubUrl
										.replace("https://github.com/", "")
										.split("/")[0]
								: null;

							return (
								<a
									key={skill.skillId}
									href={`/skills/${skill.urlPath}`}
									className="group relative bg-card-bg border border-card-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 no-underline"
								>
									{/* Header */}
									<div className="flex items-start justify-between mb-3">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-accent/40" />
											<span className="text-[11px] font-mono text-muted tracking-wide">
												SKILL.md
											</span>
											{skill.githubStars != null && skill.githubStars > 0 && (
												<span className="flex items-center gap-1 text-[10px] font-mono text-muted/60">
													<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400/70">
														<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
													</svg>
													{formatStars(skill.githubStars)}
												</span>
											)}
										</div>
										{/* Unfavorite button (filled star) */}
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setRemoveTarget(skill);
											}}
											className="flex-shrink-0 p-1.5 rounded-md text-amber-400 hover:text-amber-300 transition-colors"
											title="Remove from favorites"
										>
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="currentColor"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
											</svg>
										</button>
									</div>

									{/* Name */}
									<h3 className="text-[15px] font-semibold text-foreground mb-2 group-hover:text-foreground/90">
										{skill.name}
									</h3>

									{/* Publisher */}
									{publisher && (
										<p className="text-[12px] font-mono text-accent mb-3">
											from "{publisher}"
										</p>
									)}

									{/* Description */}
									<p className="text-[13px] text-muted leading-relaxed line-clamp-3">
										{skill.summary || skill.description}
									</p>

									{/* Categories */}
									{skill.categories.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-4">
											{skill.categories.slice(0, 3).map((cat) => (
												<span
													key={cat}
													className="text-[10px] font-mono tracking-wider uppercase text-muted/60 bg-surface-hover px-2 py-0.5 rounded"
												>
													{cat}
												</span>
											))}
										</div>
									)}
								</a>
							);
						})}
					</div>

					{/* Load more */}
					{hasMore && (
						<div className="mt-10 text-center">
							<button
								onClick={loadMore}
								disabled={isLoadingMore}
								className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium text-muted border border-border rounded-lg hover:text-foreground hover:border-accent/40 transition-colors disabled:opacity-50"
							>
								{isLoadingMore ? (
									<>
										<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
										Loading...
									</>
								) : (
									"Load more"
								)}
							</button>
						</div>
					)}
				</>
			)}

			{/* Remove confirmation dialog */}
			{removeTarget && (
				<ConfirmationDialog
					title="Remove from favorites?"
					message={`"${removeTarget.name}" will be removed from your favorites.`}
					confirmLabel="Remove"
					onConfirm={handleRemove}
					onCancel={() => setRemoveTarget(null)}
					isLoading={isRemoving}
				/>
			)}
		</div>
	);
}
