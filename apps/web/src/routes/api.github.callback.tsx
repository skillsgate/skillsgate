import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createAuth } from "~/lib/auth";
import { getDb } from "@skillsgate/database";

/**
 * GET /api/github/callback
 *
 * Handles the GitHub OAuth callback after the user grants repo access.
 * Exchanges the code for a token and stores it in the account table.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
	const env = context.cloudflare.env as any;
	const url = new URL(request.url);

	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");

	// User denied access
	if (error) {
		return redirect("/dashboard/publisher/repos/connect?error=denied");
	}

	if (!code || !state) {
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

	// Exchange code for access token
	const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: `${env.APP_URL ?? "https://skillsgate.ai"}/api/github/callback`,
		}),
	});

	if (!tokenRes.ok) {
		return redirect("/dashboard/publisher/repos/connect?error=token_exchange");
	}

	const tokenData = (await tokenRes.json()) as {
		access_token?: string;
		error?: string;
		scope?: string;
	};

	if (!tokenData.access_token || tokenData.error) {
		return redirect("/dashboard/publisher/repos/connect?error=token_exchange");
	}

	// Store the new token in the account table
	const db = getDb(env);

	const account = await db.account.findFirst({
		where: { userId: session.user.id, providerId: "github" },
	});

	if (account) {
		// Update existing GitHub account with the new token (which has repo scope)
		await db.account.update({
			where: { id: account.id },
			data: { accessToken: tokenData.access_token },
		});
	} else {
		// Fetch GitHub user info to create the account record
		const ghUserRes = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`,
				"User-Agent": "SkillsGate",
				Accept: "application/vnd.github+json",
			},
		});

		if (ghUserRes.ok) {
			const ghUser = (await ghUserRes.json()) as {
				id: number;
				login: string;
			};

			await db.account.create({
				data: {
					id: crypto.randomUUID(),
					userId: session.user.id,
					providerId: "github",
					accountId: String(ghUser.id),
					accessToken: tokenData.access_token,
				},
			});
		}
	}

	// Clear the state cookie and redirect to connect page
	return new Response(null, {
		status: 302,
		headers: {
			Location: "/dashboard/publisher/repos/connect",
			"Set-Cookie": "gh_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
		},
	});
}
