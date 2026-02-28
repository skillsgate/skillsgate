import { createRequestHandler } from "@react-router/cloudflare";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - build output exists after `react-router build`
import * as build from "./build/server/index.js";

const requestHandler = createRequestHandler({ build });

export default {
	async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
		return requestHandler({
			request,
			env,
			ctx,
			waitUntil: ctx.waitUntil.bind(ctx),
			passThroughOnException: ctx.passThroughOnException.bind(ctx),
		});
	},
} satisfies ExportedHandler<CloudflareEnv>;
