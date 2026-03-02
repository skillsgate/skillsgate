import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "~/lib/api";

type SearchUser = {
	id: string;
	name: string;
	image: string | null;
	githubUsername: string;
};

type UserSearchProps = {
	onSelect: (user: SearchUser) => void;
	placeholder?: string;
	excludeUserIds?: string[];
	actionLabel?: string;
};

export function UserSearch({
	onSelect,
	placeholder = "Search GitHub username...",
	excludeUserIds = [],
	actionLabel = "Share",
}: UserSearchProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchUser[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const search = useCallback(
		async (q: string) => {
			if (abortRef.current) {
				abortRef.current.abort();
			}

			if (q.length < 2) {
				setResults([]);
				setShowDropdown(false);
				setNotFound(false);
				return;
			}

			const controller = new AbortController();
			abortRef.current = controller;
			setIsLoading(true);
			setNotFound(false);

			const res = await api.get<{ users: SearchUser[] }>(
				`/api/users/search?q=${encodeURIComponent(q)}`,
				{ signal: controller.signal },
			);

			if (controller.signal.aborted) return;

			setIsLoading(false);

			if (res.ok) {
				const filtered = res.data.users.filter(
					(u) => !excludeUserIds.includes(u.id),
				);
				setResults(filtered);
				setShowDropdown(true);
				setNotFound(filtered.length === 0);
			} else {
				setResults([]);
				setShowDropdown(true);
				setNotFound(true);
			}
		},
		[excludeUserIds],
	);

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		setQuery(value);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			search(value.trim());
		}, 300);
	}

	function handleSelect(user: SearchUser) {
		onSelect(user);
		setQuery("");
		setResults([]);
		setShowDropdown(false);
		setNotFound(false);
	}

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShowDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			if (abortRef.current) abortRef.current.abort();
		};
	}, []);

	return (
		<div ref={containerRef} className="relative">
			<div className="relative">
				<svg
					className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					type="text"
					value={query}
					onChange={handleInputChange}
					onFocus={() => {
						if (query.length >= 2) setShowDropdown(true);
					}}
					placeholder={placeholder}
					className="w-full pl-10 pr-4 py-2.5 text-[13px] text-foreground bg-surface border border-border rounded-lg placeholder:text-muted/50 focus:outline-none focus:border-accent/40 transition-colors"
				/>
				{isLoading && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
					</div>
				)}
			</div>

			{showDropdown && (
				<div className="absolute z-10 w-full mt-1 rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
					{results.length > 0 &&
						results.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between px-3 py-2.5 hover:bg-surface-hover transition-colors"
							>
								<div className="flex items-center gap-2.5 min-w-0">
									{user.image ? (
										<img
											src={user.image}
											alt=""
											className="h-7 w-7 rounded-full flex-shrink-0"
										/>
									) : (
										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover border border-border text-[10px] font-medium text-muted flex-shrink-0">
											{user.name?.charAt(0)?.toUpperCase() ?? "?"}
										</div>
									)}
									<div className="min-w-0">
										<p className="text-[13px] font-medium text-foreground truncate">
											@{user.githubUsername}
										</p>
										<p className="text-[11px] text-muted truncate">
											{user.name}
										</p>
									</div>
								</div>
								<button
									onClick={() => handleSelect(user)}
									className="flex-shrink-0 ml-2 px-3 py-1 text-[12px] font-medium text-foreground bg-surface-hover border border-border rounded-md hover:bg-accent/10 hover:border-accent/30 transition-colors"
								>
									{actionLabel}
								</button>
							</div>
						))}

					{notFound && !isLoading && (
						<div className="px-3 py-4 text-center">
							<p className="text-[13px] text-muted">
								{query.length >= 2
									? `No users found matching "${query}"`
									: "Type at least 2 characters to search"}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
