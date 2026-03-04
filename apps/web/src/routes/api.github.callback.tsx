import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createAuth } from "~/lib/auth";
import { getDb } from "@skillsgate/database";

/**
 * GET /api/github/callback
 *
 * Handles the GitHub App installation callback.
 * Stores the installation id for the current user.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
	const env = context.cloudflare.env as any;
	const url = new URL(request.url);
	const secureCookie = url.protocol === "https:";

	const installationId = url.searchParams.get("installation_id");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");

	// User denied access
	if (error) {
		return redirect("/dashboard/publisher/repos/connect?error=denied");
	}

	if (!installationId || !state) {
		return redirect("/dashboard/publisher/repos/connect?error=invalid");
	}

	// Verify state from cookie
	const cookies = request.headers.get("Cookie") ?? "";
	const stateMatch = cookies.match(/gh_oauth_state=([^;]+)/);
	const savedState = stateMatch ? stateMatch[1] : null;

	if (state !== savedState) {
		return redirect("/dashboard/publisher/repos/connect?error=invalid_state");
	}

	// Verify user is authenticated
	const auth = createAuth(env.HYPERDRIVE.connectionString, env);
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return redirect("/");
	}

	// Store the installation for this user
	const db = getDb(env);

	await db.gitHubInstallation.upsert({
		where: {
			userId_installationId: {
				userId: session.user.id,
				installationId,
			},
		},
		update: {},
		create: {
			userId: session.user.id,
			installationId,
		},
	});

	// Clear the state cookie and redirect to connect page
	const clearCookieParts = [
		"gh_oauth_state=",
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
	];
	if (secureCookie) clearCookieParts.push("Secure");

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/dashboard/publisher/repos/connect",
			"Set-Cookie": clearCookieParts.join("; "),
		},
	});
}
