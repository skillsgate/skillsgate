import { createContext, useContext } from "react";
import type { ApiClient, PublicApiClient } from "../types/api";

/**
 * Context for the authenticated API client.
 *
 * Consumers (web app, desktop app) create their own ApiClient instance via
 * `createApiClient({ baseUrl, getToken })` and provide it through this
 * context so that shared components never import auth directly.
 */
const ApiClientContext = createContext<ApiClient | null>(null);

/**
 * Context for the public (unauthenticated) API client.
 */
const PublicApiClientContext = createContext<PublicApiClient | null>(null);

export const ApiClientProvider = ApiClientContext.Provider;
export const PublicApiClientProvider = PublicApiClientContext.Provider;

export function useApiClient(): ApiClient {
	const client = useContext(ApiClientContext);
	if (!client) {
		throw new Error("useApiClient must be used within an ApiClientProvider");
	}
	return client;
}

export function usePublicApiClient(): PublicApiClient {
	const client = useContext(PublicApiClientContext);
	if (!client) {
		throw new Error("usePublicApiClient must be used within a PublicApiClientProvider");
	}
	return client;
}
