import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { createAuth } from "~/lib/auth";

async function handler({ request, context }: LoaderFunctionArgs | ActionFunctionArgs) {
	const auth = createAuth(context.cloudflare.env.HYPERDRIVE.connectionString, context.cloudflare.env as any);
	return auth.handler(request);
}

export const loader = handler;
export const action = handler;
