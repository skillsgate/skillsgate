import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { createDatabaseClient } from "@skillsgate/database";

type AuthEnv = {
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	BETTER_AUTH_SECRET: string;
	APP_URL?: string;
};

export function createAuth(connectionString: string, env: AuthEnv) {
	const prisma = createDatabaseClient(connectionString);
	const appUrl = env.APP_URL ?? "https://skillsgate.ai";
	return betterAuth({
		baseURL: appUrl,
		database: prismaAdapter(prisma, { provider: "postgresql" }),
		emailAndPassword: { enabled: false },
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				scope: ["read:user", "user:email", "read:org"],
			},
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
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
		plugins: [bearer()],
		basePath: "/api/auth",
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [appUrl],
	});
}

export type Auth = ReturnType<typeof createAuth>;
