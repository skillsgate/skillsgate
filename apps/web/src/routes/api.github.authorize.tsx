import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createAuth } from "~/lib/auth";

/**
 * GET /api/github/authorize
 *
 * Redirects the user to GitHub App installation flow.
 * Users explicitly choose which repos to grant access to.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
	const env = context.cloudflare.env as any;

	// Verify user is authenticated
	const auth = createAuth(env.HYPERDRIVE.connectionString, env);
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return redirect("/");
	}

	const appSlug = env.GITHUB_APP_SLUG;
	const appUrl = env.APP_URL ?? "https://skillsgate.ai";
	const callbackUrl = `${appUrl}/api/github/callback`;

	if (!appSlug) {
		return redirect("/dashboard/publisher/repos/connect?error=app_not_configured");
	}

	// Generate a state token to prevent CSRF
	const state = crypto.randomUUID();

	// Store state in a cookie so we can verify it on callback
	const url = new URL(`https://github.com/apps/${appSlug}/installations/new`);
	url.searchParams.set("state", state);
	url.searchParams.set("redirect_url", callbackUrl);

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
			"Set-Cookie": `gh_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
		},
	});
}
