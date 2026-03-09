import { createRequestHandler } from "@react-router/cloudflare";

// Build output types don't match at dev time — only exists after `react-router build`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as build from "./build/server/index.js";

const requestHandler = createRequestHandler(({ build } as any));

export default {
	async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
		return (requestHandler as any)({
			request,
			env,
			ctx,
			waitUntil: ctx.waitUntil.bind(ctx),
			passThroughOnException: ctx.passThroughOnException.bind(ctx),
		});
	},
} satisfies ExportedHandler<CloudflareEnv>;
