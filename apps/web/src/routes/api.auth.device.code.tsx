import type { ActionFunctionArgs } from "react-router";
import { getDb } from "@skillsgate/database";

// Characters excluding ambiguous ones: O, 0, I, 1, L
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateUserCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(8));
	const chars = Array.from(bytes, (b) => CHARSET[b % CHARSET.length]);
	return chars.slice(0, 4).join("") + "-" + chars.slice(4).join("");
}

export async function action({ context }: ActionFunctionArgs) {
	const db = getDb(context.cloudflare.env);

	const deviceCode = crypto.randomUUID();
	const userCode = generateUserCode();
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

	await db.deviceCode.create({
		data: {
			deviceCode,
			userCode,
			status: "pending",
			expiresAt,
		},
	});

	const appUrl = context.cloudflare.env.APP_URL ?? "http://localhost:5173";

	return Response.json({
		device_code: deviceCode,
		user_code: userCode,
		verification_uri: `${appUrl}/cli/auth?code=${userCode}`,
		expires_in: 900,
		interval: 5,
	});
}
