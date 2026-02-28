import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createDatabaseClient } from "@skillsgate/database";

export function createAuth(connectionString: string) {
	const prisma = createDatabaseClient(connectionString);
	return betterAuth({
		database: prismaAdapter(prisma, { provider: "postgresql" }),
		emailAndPassword: { enabled: false },
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
		},
		account: {
			accountLinking: {
				enabled: true,
				trustedProviders: ["github", "google"],
			},
		},
		session: {
			expiresIn: 60 * 60 * 24 * 30, // 30 days
			cookieCache: {
				enabled: true,
				maxAge: 60 * 5, // 5 min cache
			},
		},
		basePath: "/api/auth",
		secret: process.env.BETTER_AUTH_SECRET,
		trustedOrigins: [
			process.env.APP_URL ?? "http://localhost:3000",
		],
	});
}

export type Auth = ReturnType<typeof createAuth>;
