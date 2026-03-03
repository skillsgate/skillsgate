import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createAuth } from "~/lib/auth";

/**
 * GET /api/github/authorize
 *
 * Redirects the user to GitHub OAuth with `repo` scope.
 * This is a separate flow from sign-in — used when the user
 * explicitly wants to grant repo access for connecting repos.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
	const env = context.cloudflare.env as any;

	// Verify user is authenticated
	const auth = createAuth(env.HYPERDRIVE.connectionString, env);
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return redirect("/");
	}

	const clientId = env.GITHUB_CLIENT_ID;
	const appUrl = env.APP_URL ?? "https://skillsgate.ai";
	const callbackUrl = `${appUrl}/api/github/callback`;

	// Generate a state token to prevent CSRF
	const state = crypto.randomUUID();

	// Store state in a cookie so we can verify it on callback
	const url = new URL("https://github.com/login/oauth/authorize");
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_uri", callbackUrl);
	url.searchParams.set("scope", "read:user user:email repo");
	url.searchParams.set("state", state);

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
			"Set-Cookie": `gh_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
		},
	});
}
