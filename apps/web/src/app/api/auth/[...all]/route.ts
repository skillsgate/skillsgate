import { getAuth } from "@/lib/auth-helper";

async function handler(request: Request) {
	const auth = await getAuth();
	return auth.handler(request);
}

export { handler as GET, handler as POST };
