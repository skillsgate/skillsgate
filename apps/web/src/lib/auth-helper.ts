import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "./auth";

export async function getAuth() {
	const { env } = await getCloudflareContext();
	return createAuth(env.HYPERDRIVE.connectionString);
}
