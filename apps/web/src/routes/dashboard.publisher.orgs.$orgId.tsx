import { useState } from "react";
import { Link, useParams } from "react-router";
import { UserSearch, ConfirmationDialog, useApiClient } from "@skillsgate/ui";

/* ─── Types matching API contract ─── */

type OrgUser = {
	id: string;
	name: string;
	image: string | null;
	githubUsername: string;
};

type OrgMember = {
	user: OrgUser;
	role: "owner" | "admin" | "member";
	joinedAt: string;
};

type OrgSkill = {
	id: string;
	slug: string;
	name: string;
	description: string;
	sourceType: string;
	createdAt: string;
};

/* ─── Mock data (swap for real API calls) ─── */

function getMockMembers(): OrgMember[] {
	return [
		{
			user: {
				id: "u_owner",
				name: "Sultan Valiyev",
				image: null,
				githubUsername: "sultan",
			},
			role: "owner",
			joinedAt: "2026-01-01T00:00:00Z",
		},
		{
			user: {
				id: "u_1",
				name: "Alice Chen",
				image: null,
				githubUsername: "alice",
			},
			role: "admin",
			joinedAt: "2026-01-15T00:00:00Z",
		},
		{
			user: {
				id: "u_2",
				name: "Bob Smith",
				image: null,
				githubUsername: "bob",
			},
			role: "member",
			joinedAt: "2026-02-01T00:00:00Z",
		},
		{
			user: {
				id: "u_3",
				name: "Charlie Brown",
				image: null,
				githubUsername: "charlie",
			},
			role: "member",
			joinedAt: "2026-02-10T00:00:00Z",
		},
	];
}

function getMockSkills(): OrgSkill[] {
	return [
		{
			id: "sk_org_1",
			slug: "acme-ci-pipeline",
			name: "acme-ci-pipeline",
			description: "Standard CI/CD pipeline for Acme projects",
			sourceType: "github",
			createdAt: "2026-01-20T00:00:00Z",
		},
		{
			id: "sk_org_2",
			slug: "acme-deploy",
			name: "acme-deploy",
			description: "Acme deployment automation",
			sourceType: "github",
			createdAt: "2026-01-25T00:00:00Z",
		},
		{
			id: "sk_org_3",
			slug: "acme-onboarding",
			name: "acme-onboarding",
			description: "New developer onboarding guide",
			sourceType: "r2",
			createdAt: "2026-02-05T00:00:00Z",
		},
	];
}

/* ─── Helpers ─── */

function getRoleBadge(role: string) {
	switch (role) {
		case "owner":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
					Owner
				</span>
			);
		case "admin":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
					Admin
				</span>
			);
		case "member":
			return (
				<span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded-full bg-surface-hover text-muted border border-border">
					Member
				</span>
			);
		default:
			return null;
	}
}

/* ─── Component ─── */

export default function OrgManagementPage() {
	const api = useApiClient();
	const { orgId } = useParams();
	const [members, setMembers] = useState<OrgMember[]>(getMockMembers);
	const [skills] = useState<OrgSkill[]>(getMockSkills);
	const [removeTarget, setRemoveTarget] = useState<OrgMember | null>(null);
	const [isRemoving, setIsRemoving] = useState(false);
	const [roleChangeTarget, setRoleChangeTarget] = useState<string | null>(null);
	const [isAddingMember, setIsAddingMember] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);

	const orgName = "Acme Corp"; // Would come from API in real implementation

	async function handleAddMember(user: OrgUser) {
		setIsAddingMember(true);
		setAddError(null);

		const res = await api.post<{ member: OrgMember }>(
			`/api/orgs/${orgId}/members`,
			{ githubUsername: user.githubUsername, role: "member" },
		);

		setIsAddingMember(false);

		if (res.ok) {
			setMembers((prev) => [...prev, res.data.member]);
		} else if (!res.ok && res.status === 404) {
			setAddError(`@${user.githubUsername} isn't on SkillsGate yet.`);
		} else if (!res.ok) {
			setAddError(res.error);
		}
	}

	async function handleRemoveMember() {
		if (!removeTarget) return;
		setIsRemoving(true);

		const res = await api.delete(
			`/api/orgs/${orgId}/members/${removeTarget.user.id}`,
		);

		if (res.ok) {
			setMembers((prev) =>
				prev.filter((m) => m.user.id !== removeTarget.user.id),
			);
		}

		setIsRemoving(false);
		setRemoveTarget(null);
	}

	async function handleRoleChange(userId: string, newRole: string) {
		const res = await api.patch<{ member: OrgMember }>(
			`/api/orgs/${orgId}/members/${userId}`,
			{ role: newRole },
		);

		if (res.ok) {
			setMembers((prev) =>
				prev.map((m) =>
					m.user.id === userId ? { ...m, role: res.data.member.role } : m,
				),
			);
		}

		setRoleChangeTarget(null);
	}

	const existingUserIds = members.map((m) => m.user.id);

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
				Back to publisher
			</Link>

			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-2xl font-semibold tracking-tight text-foreground">
					{orgName}
				</h1>
				<button className="px-3 py-1.5 text-[12px] font-medium text-muted border border-border rounded-lg hover:text-foreground hover:border-accent/30 transition-colors">
					Settings
				</button>
			</div>

			{/* Members section */}
			<section className="mb-8">
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					<div className="px-5 py-4 border-b border-border">
						<h2 className="text-[14px] font-semibold text-foreground">
							Members ({members.length})
						</h2>
					</div>

					<div className="divide-y divide-border">
						{members.map((member) => {
							const isOwner = member.role === "owner";
							return (
								<div
									key={member.user.id}
									className="flex items-center justify-between px-5 py-3"
								>
									<div className="flex items-center gap-3 min-w-0">
										{member.user.image ? (
											<img
												src={member.user.image}
												alt=""
												className="h-7 w-7 rounded-full flex-shrink-0"
											/>
										) : (
											<div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover border border-border text-[10px] font-medium text-muted flex-shrink-0">
												{member.user.name
													?.charAt(0)
													?.toUpperCase() ?? "?"}
											</div>
										)}
										<div className="min-w-0">
											<p className="text-[13px] font-medium text-foreground truncate">
												@{member.user.githubUsername}
											</p>
											<p className="text-[11px] text-muted truncate">
												{member.user.name}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3 flex-shrink-0 ml-3">
										{roleChangeTarget === member.user.id ? (
											<div className="flex items-center gap-1">
												{(["owner", "admin", "member"] as const).map(
													(role) => (
														<button
															key={role}
															onClick={() =>
																handleRoleChange(
																	member.user.id,
																	role,
																)
															}
															className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
																member.role === role
																	? "bg-accent/20 text-foreground"
																	: "text-muted hover:text-foreground hover:bg-surface-hover"
															}`}
														>
															{role}
														</button>
													),
												)}
												<button
													onClick={() => setRoleChangeTarget(null)}
													className="ml-1 text-muted hover:text-foreground"
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
														<line x1="18" y1="6" x2="6" y2="18" />
														<line x1="6" y1="6" x2="18" y2="18" />
													</svg>
												</button>
											</div>
										) : (
											<>
												{getRoleBadge(member.role)}
												{!isOwner && (
													<div className="flex items-center gap-1.5">
														<button
															onClick={() =>
																setRoleChangeTarget(
																	member.user.id,
																)
															}
															className="px-2 py-1 text-[11px] font-medium text-muted border border-border rounded-md hover:text-foreground hover:border-accent/30 transition-colors"
														>
															Change
														</button>
														<button
															onClick={() =>
																setRemoveTarget(member)
															}
															className="px-2 py-1 text-[11px] font-medium text-muted border border-border rounded-md hover:text-red-400 hover:border-red-400/30 transition-colors"
														>
															Remove
														</button>
													</div>
												)}
											</>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Add member */}
					<div className="px-5 py-4 border-t border-border">
						<p className="text-[12px] font-medium text-muted mb-2">
							Add member
						</p>
						<UserSearch
							onSelect={handleAddMember}
							placeholder="Search GitHub username..."
							excludeUserIds={existingUserIds}
							actionLabel="Add"
						/>
						{isAddingMember && (
							<p className="text-[12px] text-muted mt-2">Adding...</p>
						)}
						{addError && (
							<p className="text-[12px] text-red-400 mt-2">{addError}</p>
						)}
					</div>
				</div>
			</section>

			{/* Skills section */}
			<section className="mb-8">
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					<div className="px-5 py-4 border-b border-border">
						<h2 className="text-[14px] font-semibold text-foreground">
							Skills ({skills.length})
						</h2>
					</div>

					{skills.length > 0 ? (
						<div className="divide-y divide-border">
							{skills.map((skill) => (
								<div
									key={skill.id}
									className="flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors"
								>
									<div className="min-w-0">
										<p className="text-[13px] font-medium text-foreground truncate">
											{skill.name}
										</p>
										<p className="text-[11px] text-muted truncate">
											{skill.description}
										</p>
									</div>
									<span className="flex-shrink-0 ml-3 text-[11px] font-mono text-muted">
										{skill.sourceType === "github"
											? "GitHub"
											: "SkillsGate"}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="px-5 py-8 text-center">
							<p className="text-[13px] text-muted">
								No skills in this organization yet.
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Connected Repos placeholder */}
			<section className="mb-8">
				<div className="rounded-xl border border-card-border bg-card-bg overflow-hidden">
					<div className="px-5 py-4 border-b border-border">
						<h2 className="text-[14px] font-semibold text-foreground">
							Connected Repos
						</h2>
					</div>
					<div className="px-5 py-8 text-center">
						<p className="text-[13px] text-muted">
							GitHub repo syncing coming soon.
						</p>
						<p className="text-[12px] text-muted/50 mt-1">
							Connect repos to automatically sync skills from your codebase.
						</p>
					</div>
				</div>
			</section>

			{/* Remove member confirmation */}
			{removeTarget && (
				<ConfirmationDialog
					title="Remove member?"
					message={`Remove @${removeTarget.user.githubUsername} from ${orgName}? They will lose access to all organization skills.`}
					confirmLabel="Remove"
					onConfirm={handleRemoveMember}
					onCancel={() => setRemoveTarget(null)}
					isLoading={isRemoving}
				/>
			)}
		</div>
	);
}
