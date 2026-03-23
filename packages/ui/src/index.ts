// Types
export type {
	CatalogSkill,
	SearchResult,
} from "./types/skill";

export type {
	CatalogResponse,
	SemanticSearchResponse,
	KeywordSearchResponse,
	RequestOptions,
	ApiResult,
	ApiClient,
	PublicApiClient,
	ApiClientConfig,
	PublicApiClientConfig,
} from "./types/api";

// Lib
export {
	createApiClient,
	createPublicApiClient,
} from "./lib/api-client";

export { formatStars } from "./lib/format";

// Context
export { ApiClientProvider, useApiClient, usePublicApiClient } from "./lib/api-context";
export { AuthProvider, useAuth } from "./lib/auth-context";
export type { AuthAdapter, SessionUser } from "./lib/auth-context";
export { PublicApiClientProvider } from "./lib/api-context";

// Hooks
export { FavoritesProvider, useFavorites } from "./hooks/use-favorites";

// Components
export { FavoriteButton, FavoriteButtonWide } from "./components/favorite-button";
export { ConfirmationDialog } from "./components/confirmation-dialog";
export { AuthButton } from "./components/auth-button";
export { ThemeToggle } from "./components/theme-toggle";
export { UserSearch } from "./components/user-search";
export { SkillSearch } from "./components/skill-search";
