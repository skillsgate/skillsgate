import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@skillsgate/database";
import { getAuth } from "@/lib/auth-helper";

export async function POST(request: Request) {
	// Verify the user is authenticated via Better Auth session cookie
	const auth = await getAuth();
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return Response.json({ error: "unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as { user_code?: string };
	const rawCode = body?.user_code;

	if (!rawCode || typeof rawCode !== "string") {
		return Response.json({ error: "missing_user_code" }, { status: 400 });
	}

	// Normalize: uppercase, strip spaces and dashes for lookup
	const normalized = rawCode.toUpperCase().replace(/[\s-]/g, "");
	// Re-format as XXXX-XXXX for DB lookup
	const userCode = normalized.slice(0, 4) + "-" + normalized.slice(4, 8);

	const { env } = await getCloudflareContext();
	const db = getDb(env);

	const record = await db.deviceCode.findUnique({
		where: { userCode },
	});

	if (!record) {
		return Response.json({ error: "invalid_code" }, { status: 404 });
	}

	if (record.expiresAt < new Date()) {
		await db.deviceCode.update({
			where: { id: record.id },
			data: { status: "expired" },
		});
		return Response.json({ error: "expired" }, { status: 410 });
	}

	if (record.status !== "pending") {
		return Response.json({ error: "already_used" }, { status: 409 });
	}

	// Confirm: set status, userId, and the session token for the CLI
	await db.deviceCode.update({
		where: { id: record.id },
		data: {
			status: "confirmed",
			userId: session.user.id,
			sessionToken: session.session.token,
		},
	});

	return Response.json({ success: true });
}
