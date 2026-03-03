import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "~/lib/api";

/* ─── Helpers ─── */

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

/* ─── Component ─── */

export default function NewSkillPage() {
	const navigate = useNavigate();

	// Step tracking
	const [step, setStep] = useState<1 | 2>(1);

	// Step 1 state
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugTouched, setSlugTouched] = useState(false);
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<"public" | "private">("public");
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	// Step 2 state
	const [skillId, setSkillId] = useState<string | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Validation
	const nameValid = name.length >= 2 && name.length <= 100;
	const slugValid = slug.length > 0 && SLUG_PATTERN.test(slug);
	const descriptionValid =
		description.length >= 10 && description.length <= 500;
	const step1Valid = nameValid && slugValid && descriptionValid;

	const hasSkillMd = files.some(
		(f) => f.name === "SKILL.md" || f.name === "SKILL.MD",
	);
	const step2Valid = files.length > 0 && hasSkillMd;

	function handleNameChange(value: string) {
		setName(value);
		if (!slugTouched) {
			setSlug(generateSlug(value));
		}
	}

	function handleSlugChange(value: string) {
		setSlugTouched(true);
		setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
	}

	async function handleCreateSkill() {
		if (!step1Valid) return;
		setCreating(true);
		setCreateError(null);

		const res = await api.post<{ skill: { id: string } }>("/api/skills", {
			name,
			slug,
			description,
			visibility,
		});

		setCreating(false);

		if (res.ok) {
			setSkillId(res.data.skill.id);
			setStep(2);
		} else {
			setCreateError(res.error);
		}
	}

	function addFiles(incoming: FileList | File[]) {
		const newFiles = Array.from(incoming);
		setFiles((prev) => {
			const existing = new Set(prev.map((f) => f.name));
			const unique = newFiles.filter((f) => !existing.has(f.name));
			return [...prev, ...unique];
		});
		setUploadError(null);
	}

	function removeFile(fileName: string) {
		setFiles((prev) => prev.filter((f) => f.name !== fileName));
	}

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
			if (e.dataTransfer.files.length > 0) {
				addFiles(e.dataTransfer.files);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		setDragOver(true);
	}

	function handleDragLeave(e: React.DragEvent) {
		e.preventDefault();
		setDragOver(false);
	}

	async function handlePublish() {
		if (!step2Valid || !skillId) return;
		setUploading(true);
		setUploadError(null);

		try {
			const formData = new FormData();
			for (const file of files) {
				formData.append("files", file);
			}

			const res = await fetch(`/api/skills/${skillId}/files`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (res.ok) {
				navigate(`/dashboard/publisher/skills/${skillId}`);
			} else {
				let error = "Upload failed";
				try {
					const json = await res.json();
					error =
						(json as { error?: string }).error ?? error;
				} catch {
					// ignore parse errors
				}
				setUploadError(error);
			}
		} catch {
			setUploadError("Network error. Please try again.");
		} finally {
			setUploading(false);
		}
	}

	return (
		<div>
			{/* Back link */}
			<Link
				to="/dashboard/publisher/skills"
				className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors mb-6"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				Back to skills
			</Link>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					Publish a Skill
				</h1>
				<p className="text-[14px] text-muted mt-1">
					Create a new skill and upload your files.
				</p>
			</div>

			{/* Step indicator */}
			<div className="flex items-center gap-3 mb-8">
				<div
					className={`flex items-center gap-2 text-[13px] font-medium ${
						step === 1 ? "text-foreground" : "text-muted"
					}`}
				>
					<span
						className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono ${
							step === 1
								? "bg-accent text-white"
								: "bg-surface-hover text-muted border border-border"
						}`}
					>
						1
					</span>
					Metadata
				</div>
				<div className="h-px w-8 bg-border" />
				<div
					className={`flex items-center gap-2 text-[13px] font-medium ${
						step === 2 ? "text-foreground" : "text-muted"
					}`}
				>
					<span
						className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono ${
							step === 2
								? "bg-accent text-white"
								: "bg-surface-hover text-muted border border-border"
						}`}
					>
						2
					</span>
					Upload Files
				</div>
			</div>

			{/* Step 1: Metadata form */}
			{step === 1 && (
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					<div className="px-5 py-4 border-b border-border">
						<h2 className="text-[14px] font-semibold text-foreground">
							Skill Details
						</h2>
						<p className="text-[12px] text-muted mt-0.5">
							Describe your skill so others can find and use it.
						</p>
					</div>

					<div className="px-5 py-5 space-y-5">
						{/* Name */}
						<div>
							<label className="text-[11px] font-mono tracking-[0.1em] uppercase text-muted block mb-1.5">
								Name
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) =>
									handleNameChange(e.target.value)
								}
								placeholder="My Awesome Skill"
								maxLength={100}
								className="w-full px-3 py-2 text-[14px] text-foreground bg-transparent border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
							/>
							<p className="text-[11px] text-muted/60 mt-1">
								2-100 characters.{" "}
								{name.length > 0 && (
									<span
										className={
											nameValid
												? "text-emerald-400"
												: "text-red-400"
										}
									>
										{name.length}/100
									</span>
								)}
							</p>
						</div>

						{/* Slug */}
						<div>
							<label className="text-[11px] font-mono tracking-[0.1em] uppercase text-muted block mb-1.5">
								Slug
							</label>
							<input
								type="text"
								value={slug}
								onChange={(e) =>
									handleSlugChange(e.target.value)
								}
								placeholder="my-awesome-skill"
								className="w-full px-3 py-2 text-[14px] text-foreground font-mono bg-transparent border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
							/>
							<p className="text-[11px] text-muted/60 mt-1">
								Lowercase letters, numbers, and hyphens only.
								{slug.length > 0 && !slugValid && (
									<span className="text-red-400 ml-1">
										Invalid slug format.
									</span>
								)}
							</p>
						</div>

						{/* Description */}
						<div>
							<label className="text-[11px] font-mono tracking-[0.1em] uppercase text-muted block mb-1.5">
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) =>
									setDescription(e.target.value)
								}
								placeholder="Describe what this skill does..."
								rows={3}
								maxLength={500}
								className="w-full px-3 py-2 text-[14px] text-foreground bg-transparent border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-none"
							/>
							<p className="text-[11px] text-muted/60 mt-1">
								10-500 characters.{" "}
								{description.length > 0 && (
									<span
										className={
											descriptionValid
												? "text-emerald-400"
												: "text-red-400"
										}
									>
										{description.length}/500
									</span>
								)}
							</p>
						</div>

						{/* Visibility */}
						<div>
							<label className="text-[11px] font-mono tracking-[0.1em] uppercase text-muted block mb-1.5">
								Visibility
							</label>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setVisibility("public")}
									className={`px-4 py-2 text-[13px] font-medium border rounded-lg transition-colors ${
										visibility === "public"
											? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
											: "border-border text-muted hover:text-foreground"
									}`}
								>
									Public
								</button>
								<button
									type="button"
									onClick={() => setVisibility("private")}
									className={`px-4 py-2 text-[13px] font-medium border rounded-lg transition-colors ${
										visibility === "private"
											? "border-amber-500/40 bg-amber-500/10 text-amber-400"
											: "border-border text-muted hover:text-foreground"
									}`}
								>
									Private
								</button>
							</div>
							<p className="text-[11px] text-muted/60 mt-1.5">
								{visibility === "public"
									? "Anyone can discover and install this skill."
									: "Only people you share with can access this skill."}
							</p>
						</div>
					</div>

					{/* Footer */}
					<div className="px-5 py-4 border-t border-border flex items-center justify-between">
						{createError && (
							<p className="text-[12px] text-red-400">
								{createError}
							</p>
						)}
						<div className="ml-auto">
							<button
								onClick={handleCreateSkill}
								disabled={!step1Valid || creating}
								className="px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{creating && (
									<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								)}
								Next
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Step 2: File upload */}
			{step === 2 && (
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					<div className="px-5 py-4 border-b border-border">
						<h2 className="text-[14px] font-semibold text-foreground">
							Upload Files
						</h2>
						<p className="text-[12px] text-muted mt-0.5">
							Your skill must include a{" "}
							<code className="font-mono text-accent">
								SKILL.md
							</code>{" "}
							file.
						</p>
					</div>

					<div className="px-5 py-5 space-y-4">
						{/* Drop zone */}
						<div
							onDrop={handleDrop}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onClick={() => fileInputRef.current?.click()}
							className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
								dragOver
									? "border-accent/50 bg-accent/5"
									: "border-border hover:border-muted"
							}`}
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mx-auto text-muted mb-3"
							>
								<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<p className="text-[14px] text-muted mb-1">
								Drag and drop files here, or click to browse
							</p>
							<p className="text-[11px] text-muted/50">
								Must include SKILL.md
							</p>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								onChange={(e) => {
									if (e.target.files) {
										addFiles(e.target.files);
									}
									e.target.value = "";
								}}
								className="hidden"
							/>
						</div>

						{/* File list */}
						{files.length > 0 && (
							<div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
								{files.map((file) => (
									<div
										key={file.name}
										className="flex items-center justify-between px-4 py-2.5"
									>
										<div className="flex items-center gap-2 min-w-0">
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="text-muted flex-shrink-0"
											>
												<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
												<polyline points="14 2 14 8 20 8" />
											</svg>
											<span className="text-[13px] font-mono text-foreground truncate">
												{file.name}
											</span>
											{file.name === "SKILL.md" && (
												<span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
													Required
												</span>
											)}
										</div>
										<div className="flex items-center gap-3 flex-shrink-0 ml-3">
											<span className="text-[11px] text-muted font-mono">
												{formatFileSize(file.size)}
											</span>
											<button
												onClick={() =>
													removeFile(file.name)
												}
												className="text-muted hover:text-red-400 transition-colors"
											>
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<line
														x1="18"
														y1="6"
														x2="6"
														y2="18"
													/>
													<line
														x1="6"
														y1="6"
														x2="18"
														y2="18"
													/>
												</svg>
											</button>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Validation hint */}
						{files.length > 0 && !hasSkillMd && (
							<p className="text-[12px] text-red-400">
								A SKILL.md file is required. Please add one.
							</p>
						)}
					</div>

					{/* Footer */}
					<div className="px-5 py-4 border-t border-border flex items-center justify-between">
						{uploadError && (
							<p className="text-[12px] text-red-400">
								{uploadError}
							</p>
						)}
						<div className="ml-auto">
							<button
								onClick={handlePublish}
								disabled={!step2Valid || uploading}
								className="px-4 py-2 text-[13px] font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
							>
								{uploading && (
									<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								)}
								Publish
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
