import { authClient } from "~/lib/auth-client";

const API_BASE_URL =
	typeof window === "undefined"
		? "https://api.skillsgate.ai"
		: "https://api.skillsgate.ai";

type RequestOptions = {
	headers?: Record<string, string>;
	signal?: AbortSignal;
};

async function getAuthToken(): Promise<string | null> {
	try {
		const res = await authClient.getSession();
		return res.data?.session?.token ?? null;
	} catch {
		return null;
	}
}

function getCookieToken(request?: Request): string | null {
	if (!request) return null;
	const cookie = request.headers.get("Cookie") ?? "";
	const match = cookie.match(/better-auth\.session_token=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : null;
}

async function makeRequest<T>(
	method: string,
	path: string,
	body?: unknown,
	options?: RequestOptions & { token?: string },
): Promise<{ data: T; ok: true } | { error: string; status: number; ok: false }> {
	const token = options?.token ?? (await getAuthToken());
	if (!token) {
		return { error: "Not authenticated", status: 401, ok: false };
	}

	const url = `${API_BASE_URL}${path}`;
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

async function makePublicRequest<T>(
	method: string,
	path: string,
	body?: unknown,
	options?: RequestOptions,
): Promise<{ data: T; ok: true } | { error: string; status: number; ok: false }> {
	const url = `${API_BASE_URL}${path}`;
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

/**
 * Public API client — no authentication required.
 * Use this for public endpoints like catalog browsing and keyword search.
 */
export const publicApi = {
	get<T>(path: string, options?: RequestOptions) {
		return makePublicRequest<T>("GET", path, undefined, options);
	},
};

/**
 * Server-side API client — extracts token from the incoming request cookies.
 * Use this in loaders and actions.
 */
export function createServerApi(request: Request) {
	const token = getCookieToken(request);

	return {
		get<T>(path: string, options?: RequestOptions) {
			return makeRequest<T>("GET", path, undefined, { ...options, token: token ?? undefined });
		},
		post<T>(path: string, body?: unknown, options?: RequestOptions) {
			return makeRequest<T>("POST", path, body, { ...options, token: token ?? undefined });
		},
		delete<T>(path: string, options?: RequestOptions) {
			return makeRequest<T>("DELETE", path, undefined, { ...options, token: token ?? undefined });
		},
		patch<T>(path: string, body?: unknown, options?: RequestOptions) {
			return makeRequest<T>("PATCH", path, body, { ...options, token: token ?? undefined });
		},
	};
}

/**
 * Client-side API client — gets token from the auth client session.
 * Use this in event handlers and client components.
 */
export const api = {
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
	/** Upload FormData (multipart) — does NOT set Content-Type so the browser adds the boundary. */
	async upload<T>(
		path: string,
		formData: FormData,
		options?: RequestOptions,
	): Promise<{ data: T; ok: true } | { error: string; status: number; ok: false }> {
		const token = await getAuthToken();
		if (!token) {
			return { error: "Not authenticated", status: 401, ok: false };
		}

		const url = `${API_BASE_URL}${path}`;
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
