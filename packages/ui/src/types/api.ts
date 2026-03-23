import type { CatalogSkill, SearchResult } from "./skill";

export type RequestOptions = {
	headers?: Record<string, string>;
	signal?: AbortSignal;
};

export type ApiResult<T> =
	| { data: T; ok: true }
	| { error: string; status: number; ok: false };

export type ApiClient = {
	get<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>>;
	post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>>;
	delete<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>>;
	patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResult<T>>;
	upload<T>(path: string, formData: FormData, options?: RequestOptions): Promise<ApiResult<T>>;
};

export type PublicApiClient = {
	get<T>(path: string, options?: RequestOptions): Promise<ApiResult<T>>;
};

export type ApiClientConfig = {
	baseUrl: string;
	getToken: () => Promise<string | null>;
};

export type PublicApiClientConfig = {
	baseUrl: string;
};

export type CatalogResponse = {
	skills: CatalogSkill[];
	meta: { total: number; limit: number; offset: number; hasMore: boolean };
};

export type SemanticSearchResponse = {
	results: SearchResult[];
	meta: {
		query: string;
		total: number;
		limit: number;
		remainingSearches: number;
	};
};

export type KeywordSearchResponse = {
	skills: {
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
	}[];
	meta: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
};
