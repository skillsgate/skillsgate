import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@skillsgate/database";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const deviceCode = url.searchParams.get("device_code");

	if (!deviceCode) {
		return Response.json({ error: "missing_device_code" }, { status: 400 });
	}

	const { env } = await getCloudflareContext();
	const db = getDb(env);

	const record = await db.deviceCode.findUnique({
		where: { deviceCode },
		include: { user: true },
	});

	if (!record) {
		return Response.json({ error: "not_found" }, { status: 404 });
	}

	// Check expiry
	if (record.expiresAt < new Date()) {
		if (record.status !== "expired") {
			await db.deviceCode.update({
				where: { id: record.id },
				data: { status: "expired" },
			});
		}
		return Response.json({ error: "expired" }, { status: 410 });
	}

	// Rate limit: reject if polled less than 4 seconds ago
	if (record.lastPolledAt) {
		const elapsed = Date.now() - record.lastPolledAt.getTime();
		if (elapsed < 4000) {
			return Response.json({ error: "slow_down" }, { status: 429 });
		}
	}

	// Update last polled timestamp
	await db.deviceCode.update({
		where: { id: record.id },
		data: { lastPolledAt: new Date() },
	});

	if (record.status === "pending") {
		return Response.json({ status: "pending" }, { status: 202 });
	}

	if (record.status === "confirmed" && record.sessionToken && record.user) {
		const response = Response.json({
			access_token: record.sessionToken,
			user: {
				id: record.user.id,
				name: record.user.name,
				email: record.user.email,
				image: record.user.image,
			},
		});

		// One-time read: delete the device code row
		await db.deviceCode.delete({ where: { id: record.id } });

		return response;
	}

	// Fallback
	return Response.json({ status: "pending" }, { status: 202 });
}
