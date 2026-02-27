import Image from "next/image";

export default function Home() {
	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center px-6">
			{/* Background radial glow */}
			<div
				className="animate-glow-pulse pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full"
				style={{
					background:
						"radial-gradient(circle, rgba(180, 180, 200, 0.06) 0%, rgba(180, 180, 200, 0.02) 40%, transparent 70%)",
				}}
			/>

			{/* Subtle top line accent */}
			<div className="animate-fade-in absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-zinc-700/40 to-transparent" />

			<main className="relative z-10 flex flex-col items-center gap-10 sm:gap-12 max-w-lg">
				{/* Logo */}
				<div
					className="animate-fade-up animate-subtle-float"
					style={{ animationDelay: "0.1s" }}
				>
					<Image
						src="/skillsgate-darkmode.png"
						alt="SkillsGate"
						width={340}
						height={80}
						priority
						className="w-[260px] sm:w-[340px] h-auto select-none"
						draggable={false}
					/>
				</div>

				{/* Tagline */}
				<p
					className="animate-fade-up text-center text-[15px] sm:text-[17px] tracking-wide text-zinc-500 font-light leading-relaxed"
					style={{ animationDelay: "0.35s" }}
				>
					AI Skills Hub
				</p>

				{/* CTA Button */}
				<div
					className="animate-fade-up"
					style={{ animationDelay: "0.6s" }}
				>
					<a
						href="https://forms.gle/5i8NP8ZAc52Hfhr17"
						target="_blank"
						rel="noopener noreferrer"
						className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide text-zinc-200 transition-all duration-300 hover:text-white"
					>
						{/* Button border with glow */}
						<span className="absolute inset-0 rounded-full border border-zinc-700/60 transition-all duration-300 group-hover:border-zinc-500/80 group-hover:shadow-[0_0_20px_rgba(161,161,170,0.08)]" />

						{/* Subtle background on hover */}
						<span className="absolute inset-0 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/[0.03]" />

						<span className="relative">Join Waitlist</span>

						{/* Arrow */}
						<svg
							className="relative ml-2.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
							/>
						</svg>
					</a>
				</div>
			</main>

			{/* Bottom accent */}
			<div className="animate-fade-in absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-t from-transparent via-zinc-800/30 to-transparent" />
		</div>
	);
}
