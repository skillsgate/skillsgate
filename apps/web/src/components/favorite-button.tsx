import { useFavorites } from "~/hooks/use-favorites";

type FavoriteButtonProps = {
  skillId: string;
  size?: "sm" | "md";
  className?: string;
};

export function FavoriteButton({ skillId, size = "sm", className = "" }: FavoriteButtonProps) {
  const { favorites, toggle } = useFavorites();
  const isFavorited = favorites.has(skillId);

  const iconSize = size === "md" ? 20 : 16;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(skillId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
        isFavorited
          ? "text-amber-400 hover:text-amber-300"
          : "text-muted/40 hover:text-amber-400"
      } ${className}`}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}

/**
 * Full-width "Save to favorites" / "Saved" button for the skill detail sidebar.
 */
export function FavoriteButtonWide({ skillId }: { skillId: string }) {
  const { favorites, toggle } = useFavorites();
  const isFavorited = favorites.has(skillId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(skillId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium rounded-lg border transition-colors ${
        isFavorited
          ? "text-amber-400 border-amber-400/30 hover:border-amber-400/50"
          : "text-foreground border-border hover:border-accent/40"
      }`}
      title={isFavorited ? "Remove from favorites" : "Save to favorites"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {isFavorited ? "Saved" : "Save to favorites"}
    </button>
  );
}
