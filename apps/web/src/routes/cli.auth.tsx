import { useState, useEffect, useRef } from "react";
import { authClient } from "~/lib/auth-client";

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

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center px-6">
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
							<p className="text-sm text-zinc-500 text-center">
								Sign in using the button in the top right to link your terminal session.
							</p>
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
