import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { authClient } from "~/lib/auth-client";

type State =
	| { step: "loading" }
	| { step: "unauthenticated" }
	| { step: "no-code" }
	| { step: "ready"; user: { name: string; email: string }; code: string }
	| { step: "confirming" }
	| { step: "success" }
	| { step: "error"; message: string };

export default function CliAuthPage() {
	const [searchParams] = useSearchParams();
	const code = searchParams.get("code");
	const [state, setState] = useState<State>({ step: "loading" });

	useEffect(() => {
		if (!code) {
			setState({ step: "no-code" });
			return;
		}

		authClient.getSession().then((res) => {
			if (res.data?.user) {
				setState({
					step: "ready",
					user: {
						name: res.data.user.name,
						email: res.data.user.email,
					},
					code,
				});
			} else {
				setState({ step: "unauthenticated" });
			}
		});
	}, [code]);

	async function handleConfirm() {
		if (state.step !== "ready") return;

		setState({ step: "confirming" });

		try {
			const res = await fetch("/api/auth/device/confirm", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_code: state.code }),
			});

			if (res.ok) {
				setState({ step: "success" });
			} else {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				const msg =
					data?.error === "invalid_code"
						? "That code is invalid or has expired. Run `skillsgate login` again."
						: data?.error === "already_used"
							? "That code has already been used."
							: data?.error === "expired"
								? "That code has expired. Run `skillsgate login` again."
								: "Something went wrong. Please try again.";
				setState({ step: "error", message: msg });
			}
		} catch {
			setState({ step: "error", message: "Network error. Please try again." });
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

					{state.step === "no-code" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Missing code
							</h1>
							<p className="text-sm text-zinc-500 text-center">
								Run <code className="text-zinc-300">skillsgate login</code> in your terminal to start the login flow.
							</p>
						</>
					)}

					{state.step === "unauthenticated" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Connect your CLI
							</h1>
							<p className="text-sm text-zinc-500 text-center">
								Sign in using the button in the top right, then come back to this page.
							</p>
						</>
					)}

					{state.step === "ready" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Authorize CLI
							</h1>
							<p className="text-sm text-zinc-500 text-center mb-6">
								Signed in as{" "}
								<span className="text-zinc-300">{state.user.name}</span>
							</p>
							<div className="mb-6 rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-4 py-3 text-center font-mono text-lg tracking-[0.25em] text-zinc-200">
								{state.code}
							</div>
							<button
								onClick={handleConfirm}
								className="w-full rounded-lg border border-zinc-700/60 bg-white/[0.05] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-white/[0.08] hover:text-white"
							>
								Authorize
							</button>
						</>
					)}

					{state.step === "confirming" && (
						<div className="flex flex-col items-center py-4">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300 mb-4" />
							<p className="text-sm text-zinc-400">Authorizing...</p>
						</div>
					)}

					{state.step === "error" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Something went wrong
							</h1>
							<p className="text-sm text-red-400 text-center">{state.message}</p>
						</>
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
