import type {
	RequestOptions,
	ApiResult,
	ApiClient,
	PublicApiClient,
	ApiClientConfig,
	PublicApiClientConfig,
} from "../types/api";

/**
 * Create an authenticated API client.
 *
 * The caller provides `baseUrl` and a `getToken` function that returns the
 * current auth token (or null).  This allows the web app to provide a
 * Better Auth session token while a desktop app can provide a stored device
 * token, keeping the shared components auth-agnostic.
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
	const { baseUrl, getToken } = config;

	async function makeRequest<T>(
		method: string,
		path: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<ApiResult<T>> {
		const token = await getToken();
		if (!token) {
			return { error: "Not authenticated", status: 401, ok: false };
		}

		const url = `${baseUrl}${path}`;
		const headers: Record<string, string> = {
			Authorization: `Bearer ${token}`,
			...options?.headers,
		};

		if (body !== undefined) {
			headers["Content-Type"] = "application/json";
		}

		const res = await fetch(url, {
			method,
			headers,
			cache: "no-store" as RequestCache,
			body: body !== undefined ? JSON.stringify(body) : undefined,
			signal: options?.signal,
		});

		if (res.status === 204) {
			return { data: undefined as T, ok: true };
		}

		if (!res.ok) {
			let error = `Request failed with status ${res.status}`;
			try {
				const json = await res.json();
				error = (json as { error?: string }).error ?? error;
			} catch {
				// ignore parse errors
			}
			return { error, status: res.status, ok: false };
		}

		const data = (await res.json()) as T;
		return { data, ok: true };
	}

	return {
		get<T>(path: string, options?: RequestOptions) {
			return makeRequest<T>("GET", path, undefined, options);
		},
		post<T>(path: string, body?: unknown, options?: RequestOptions) {
			return makeRequest<T>("POST", path, body, options);
		},
		delete<T>(path: string, options?: RequestOptions) {
			return makeRequest<T>("DELETE", path, undefined, options);
		},
		patch<T>(path: string, body?: unknown, options?: RequestOptions) {
			return makeRequest<T>("PATCH", path, body, options);
		},
		async upload<T>(
			path: string,
			formData: FormData,
			options?: RequestOptions,
		): Promise<ApiResult<T>> {
			const token = await getToken();
			if (!token) {
				return { error: "Not authenticated", status: 401, ok: false };
			}

			const url = `${baseUrl}${path}`;
			const res = await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					...options?.headers,
				},
				body: formData,
				signal: options?.signal,
			});

			if (!res.ok) {
				let error = `Request failed with status ${res.status}`;
				try {
					const json = await res.json();
					error = (json as { error?: string }).error ?? error;
				} catch {
					// ignore parse errors
				}
				return { error, status: res.status, ok: false };
			}

			const data = (await res.json()) as T;
			return { data, ok: true };
		},
	};
}

/**
 * Create a public (unauthenticated) API client for endpoints that do not
 * require a session, such as catalog browsing and keyword search.
 */
export function createPublicApiClient(config: PublicApiClientConfig): PublicApiClient {
	const { baseUrl } = config;

	async function makePublicRequest<T>(
		method: string,
		path: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<ApiResult<T>> {
		const url = `${baseUrl}${path}`;
		const headers: Record<string, string> = {
			...options?.headers,
		};

		if (body !== undefined) {
			headers["Content-Type"] = "application/json";
		}

		const res = await fetch(url, {
			method,
			headers,
			body: body !== undefined ? JSON.stringify(body) : undefined,
			signal: options?.signal,
		});

		if (res.status === 204) {
			return { data: undefined as T, ok: true };
		}

		if (!res.ok) {
			let error = `Request failed with status ${res.status}`;
			try {
				const json = await res.json();
				error = (json as { error?: string }).error ?? error;
			} catch {
				// ignore parse errors
			}
			return { error, status: res.status, ok: false };
		}

		const data = (await res.json()) as T;
		return { data, ok: true };
	}

	return {
		get<T>(path: string, options?: RequestOptions) {
			return makePublicRequest<T>("GET", path, undefined, options);
		},
	};
}
