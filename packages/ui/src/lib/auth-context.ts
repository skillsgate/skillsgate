import { createContext, useContext } from "react";

type SessionUser = {
	name: string;
	email: string;
	image?: string | null;
};

/**
 * Auth adapter interface that shared components use.
 *
 * The web app implements this with Better Auth; the desktop app can implement
 * it with device-code token flow.  This keeps auth-client out of shared code.
 */
export type AuthAdapter = {
	/** Returns the current session user, or null if not authenticated. */
	getUser: () => Promise<SessionUser | null>;
	/** Returns true if the user is currently authenticated. */
	isAuthenticated: () => Promise<boolean>;
	/** Trigger sign-in via a social provider. */
	signIn: (provider: "github" | "google", callbackURL?: string) => void;
	/** Sign the user out. */
	signOut: () => Promise<void>;
};

export type { SessionUser };

const AuthContext = createContext<AuthAdapter | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useAuth(): AuthAdapter {
	const auth = useContext(AuthContext);
	if (!auth) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return auth;
}
