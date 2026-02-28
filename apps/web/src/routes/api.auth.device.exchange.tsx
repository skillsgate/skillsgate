import type { ActionFunctionArgs } from "react-router";
import { getDb } from "@skillsgate/database";

export async function action({ request, context }: ActionFunctionArgs) {
	const body = (await request.json()) as { code?: string };
	const rawCode = body?.code;

	if (!rawCode || typeof rawCode !== "string") {
		return Response.json({ error: "missing_code" }, { status: 400 });
	}

	const normalized = rawCode.toUpperCase().replace(/[\s-]/g, "");
	const userCode = normalized.slice(0, 4) + "-" + normalized.slice(4, 8);

	const db = getDb(context.cloudflare.env);

	const record = await db.deviceCode.findUnique({
		where: { userCode },
		include: { user: true },
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

	if (record.status !== "confirmed" || !record.sessionToken || !record.user) {
		return Response.json({ error: "invalid_code" }, { status: 404 });
	}

	const response = Response.json({
		access_token: record.sessionToken,
		user: {
			id: record.user.id,
			name: record.user.name,
			email: record.user.email,
			image: record.user.image,
		},
	});

	// One-time use: delete after exchange
	await db.deviceCode.delete({ where: { id: record.id } });

	return response;
}
