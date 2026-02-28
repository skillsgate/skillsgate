import type { AppLoadContext } from "react-router";

declare module "react-router" {
	interface AppLoadContext {
		cloudflare: {
			env: CloudflareEnv;
			ctx: ExecutionContext;
		};
	}
}

export function getLoadContext(args: {
	request: Request;
	context: { cloudflare: { env: CloudflareEnv; ctx: ExecutionContext } };
}): AppLoadContext {
	return args.context;
}
