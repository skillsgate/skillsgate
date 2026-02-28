"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

type State =
	| { step: "loading" }
	| { step: "unauthenticated" }
	| { step: "authenticated"; user: { name: string; email: string } }
	| { step: "confirming"; user: { name: string; email: string } }
	| { step: "success" }
	| { step: "error"; message: string; user: { name: string; email: string } };

export default function CliAuthPage() {
	const [state, setState] = useState<State>({ step: "loading" });
	const [code, setCode] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		authClient.getSession().then((res) => {
			if (res.data?.user) {
				setState({
					step: "authenticated",
					user: {
						name: res.data.user.name,
						email: res.data.user.email,
					},
				});
			} else {
				setState({ step: "unauthenticated" });
			}
		});
	}, []);

	useEffect(() => {
		if (state.step === "authenticated" && inputRef.current) {
			inputRef.current.focus();
		}
	}, [state.step]);

	function handleCodeChange(raw: string) {
		// Strip non-alphanumeric, uppercase, auto-insert dash
		const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
		if (clean.length > 4) {
			setCode(clean.slice(0, 4) + "-" + clean.slice(4));
		} else {
			setCode(clean);
		}
	}

	async function handleConfirm() {
		if (state.step !== "authenticated" && state.step !== "error") return;
		const user = state.user;

		setState({ step: "confirming", user });

		try {
			const res = await fetch("/api/auth/device/confirm", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_code: code }),
			});

			if (res.ok) {
				setState({ step: "success" });
			} else {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				const msg =
					data?.error === "invalid_code"
						? "That code is invalid or has expired. Check your terminal and try again."
						: data?.error === "already_used"
							? "That code has already been used."
							: data?.error === "expired"
								? "That code has expired. Run `skillsgate login` again."
								: "Something went wrong. Please try again.";
				setState({ step: "error", message: msg, user });
			}
		} catch {
			setState({
				step: "error",
				message: "Network error. Please try again.",
				user,
			});
		}
	}

	function handleSignIn(provider: "github" | "google") {
		authClient.signIn.social({
			provider,
			callbackURL: "/cli/auth",
		});
	}

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center px-6">
			{/* Background radial glow */}
			<div
				className="animate-glow-pulse pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
				style={{
					background:
						"radial-gradient(circle, rgba(180, 180, 200, 0.06) 0%, rgba(180, 180, 200, 0.02) 40%, transparent 70%)",
				}}
			/>

			<div className="animate-fade-up relative z-10 w-full max-w-sm">
				<div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-8 backdrop-blur-sm">
					{state.step === "loading" && (
						<div className="flex justify-center py-8">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
						</div>
					)}

					{state.step === "unauthenticated" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Connect your CLI
							</h1>
							<p className="text-sm text-zinc-500 text-center mb-8">
								Sign in to link your terminal session
							</p>
							<div className="flex flex-col gap-3">
								<button
									onClick={() => handleSignIn("github")}
									className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-700/60 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-white/[0.06] hover:text-white"
								>
									<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
									Continue with GitHub
								</button>
								<button
									onClick={() => handleSignIn("google")}
									className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-700/60 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-white/[0.06] hover:text-white"
								>
									<svg className="h-5 w-5" viewBox="0 0 24 24">
										<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
										<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
										<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
										<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
									</svg>
									Continue with Google
								</button>
							</div>
						</>
					)}

					{(state.step === "authenticated" || state.step === "error") && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Authorize CLI
							</h1>
							<p className="text-sm text-zinc-500 text-center mb-6">
								Signed in as{" "}
								<span className="text-zinc-300">{state.user.name}</span>
							</p>
							<label className="block text-sm text-zinc-400 mb-2">
								Enter the code from your terminal
							</label>
							<input
								ref={inputRef}
								type="text"
								value={code}
								onChange={(e) => handleCodeChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && code.length === 9) handleConfirm();
								}}
								placeholder="XXXX-XXXX"
								className="w-full rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-4 py-3 text-center font-mono text-lg tracking-[0.25em] text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none transition-colors"
								maxLength={9}
								autoComplete="off"
								spellCheck={false}
							/>
							{state.step === "error" && (
								<p className="mt-3 text-sm text-red-400">{state.message}</p>
							)}
							<button
								onClick={handleConfirm}
								disabled={code.length !== 9}
								className="mt-4 w-full rounded-lg border border-zinc-700/60 bg-white/[0.05] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
							>
								Confirm
							</button>
						</>
					)}

					{state.step === "confirming" && (
						<div className="flex flex-col items-center py-4">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300 mb-4" />
							<p className="text-sm text-zinc-400">Confirming...</p>
						</div>
					)}

					{state.step === "success" && (
						<div className="flex flex-col items-center py-4">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-800/60 bg-emerald-900/20">
								<svg
									className="h-6 w-6 text-emerald-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h2 className="text-lg font-medium text-zinc-200 mb-1">
								CLI connected
							</h2>
							<p className="text-sm text-zinc-500">
								You can close this tab.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
