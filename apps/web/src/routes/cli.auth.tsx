import { useState, useEffect } from "react";
import { authClient } from "~/lib/auth-client";

type State =
	| { step: "loading" }
	| { step: "unauthenticated" }
	| { step: "generating" }
	| { step: "ready"; code: string }
	| { step: "error"; message: string };

export default function CliAuthPage() {
	const [state, setState] = useState<State>({ step: "loading" });
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		authClient.getSession().then((res) => {
			if (res.data?.user) {
				generateCode();
			} else {
				setState({ step: "unauthenticated" });
			}
		});
	}, []);

	async function generateCode() {
		setState({ step: "generating" });

		try {
			const res = await fetch("/api/auth/device/code", {
				method: "POST",
			});

			if (res.ok) {
				const data = (await res.json()) as { code: string };
				setState({ step: "ready", code: data.code });
			} else {
				setState({ step: "error", message: "Failed to generate code. Please try again." });
			}
		} catch {
			setState({ step: "error", message: "Network error. Please try again." });
		}
	}

	function handleCopy() {
		if (state.step !== "ready") return;
		navigator.clipboard.writeText(state.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
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
					{(state.step === "loading" || state.step === "generating") && (
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
								Sign in using the button in the top right to get your login code.
							</p>
						</>
					)}

					{state.step === "ready" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Your login code
							</h1>
							<p className="text-sm text-zinc-500 text-center mb-6">
								Copy this code and paste it into your terminal.
							</p>
							<button
								onClick={handleCopy}
								className="group mb-4 w-full rounded-lg border border-zinc-700/60 bg-zinc-800/50 px-4 py-3 text-center font-mono text-lg tracking-[0.25em] text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800/80"
							>
								{state.code}
							</button>
							<p className="text-xs text-zinc-500 text-center">
								{copied ? (
									<span className="text-emerald-400">Copied!</span>
								) : (
									"Click the code to copy"
								)}
							</p>
						</>
					)}

					{state.step === "error" && (
						<>
							<h1 className="text-lg font-medium text-zinc-200 text-center mb-2">
								Something went wrong
							</h1>
							<p className="text-sm text-red-400 text-center mb-4">{state.message}</p>
							<button
								onClick={generateCode}
								className="w-full rounded-lg border border-zinc-700/60 bg-white/[0.05] px-4 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-white/[0.08] hover:text-white"
							>
								Try again
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
