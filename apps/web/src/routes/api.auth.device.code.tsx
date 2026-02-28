import type { ActionFunctionArgs } from "react-router";
import { getDb } from "@skillsgate/database";
import { createAuth } from "~/lib/auth";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(8));
	const chars = Array.from(bytes, (b) => CHARSET[b % CHARSET.length]);
	return chars.slice(0, 4).join("") + "-" + chars.slice(4).join("");
}

export async function action({ request, context }: ActionFunctionArgs) {
	const auth = createAuth(context.cloudflare.env.HYPERDRIVE.connectionString);
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session) {
		return Response.json({ error: "unauthorized" }, { status: 401 });
	}

	const db = getDb(context.cloudflare.env);
	const userCode = generateCode();
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	await db.deviceCode.create({
		data: {
			deviceCode: crypto.randomUUID(),
			userCode,
			status: "confirmed",
			userId: session.user.id,
			sessionToken: session.session.token,
			expiresAt,
		},
	});

	return Response.json({ code: userCode });
}
