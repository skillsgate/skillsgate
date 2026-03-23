import { useMemo, type ReactNode } from "react";
import {
	ApiClientProvider,
	PublicApiClientProvider,
	AuthProvider,
	createApiClient,
	createPublicApiClient,
	type AuthAdapter,
} from "@skillsgate/ui";
import { authClient } from "~/lib/auth-client";

const API_BASE_URL = "https://api.skillsgate.ai";

/**
 * Auth adapter that bridges Better Auth to the shared AuthAdapter interface.
 */
const authAdapter: AuthAdapter = {
	async getUser() {
		const res = await authClient.getSession();
		if (!res.data?.user) return null;
		return {
			name: res.data.user.name,
			email: res.data.user.email,
			image: res.data.user.image,
		};
	},
	async isAuthenticated() {
		const res = await authClient.getSession();
		return !!res.data?.user;
	},
	signIn(provider: "github" | "google", callbackURL?: string) {
		authClient.signIn.social({
			provider,
			callbackURL: callbackURL ?? "/dashboard/skills",
		});
	},
	async signOut() {
		await authClient.signOut();
	},
};

/**
 * Wraps children with all the shared UI context providers (API clients + auth).
 * Place this inside the root layout so all pages can use shared components.
 */
export function UIProviders({ children }: { children: ReactNode }) {
	const apiClient = useMemo(
		() =>
			createApiClient({
				baseUrl: API_BASE_URL,
				async getToken() {
					try {
						const res = await authClient.getSession();
						return res.data?.session?.token ?? null;
					} catch {
						return null;
					}
				},
			}),
		[],
	);

	const publicApiClient = useMemo(
		() => createPublicApiClient({ baseUrl: API_BASE_URL }),
		[],
	);

	return (
		<AuthProvider value={authAdapter}>
			<ApiClientProvider value={apiClient}>
				<PublicApiClientProvider value={publicApiClient}>
					{children}
				</PublicApiClientProvider>
			</ApiClientProvider>
		</AuthProvider>
	);
}
