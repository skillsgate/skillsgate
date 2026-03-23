import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router";
import { ThemeToggle, AuthButton, useAuth } from "@skillsgate/ui";

export default function DashboardLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const auth = useAuth();
	const [authChecked, setAuthChecked] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		auth.isAuthenticated().then((authed) => {
			if (!authed) {
				navigate("/", { replace: true });
			} else {
				setIsAuthenticated(true);
			}
			setAuthChecked(true);
		});
	}, [navigate, auth]);

	if (!authChecked || !isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
			</div>
		);
	}

	const isPublisher = location.pathname.startsWith("/dashboard/publisher");
	const isFavorites = location.pathname === "/dashboard/favorites";
	const isSkills =
		!isFavorites &&
		!isPublisher &&
		(location.pathname === "/dashboard/skills" ||
			location.pathname === "/dashboard");

	return (
		<div className="min-h-screen">
			{/* Dashboard nav */}
			<nav className="sticky top-0 z-40 bg-nav-bg backdrop-blur-xl border-b border-nav-border">
				<div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
					{/* Left: logo + tabs */}
					<div className="flex items-center gap-8">
						<Link
							to="/"
							className="text-[16px] font-semibold tracking-tight text-foreground"
						>
							SkillsGate
						</Link>

						<div className="flex items-center gap-1">
							<Link
								to="/dashboard/skills"
								className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
									isSkills
										? "text-foreground bg-surface-hover"
										: "text-muted hover:text-foreground"
								}`}
							>
								Skills
							</Link>
							<Link
								to="/dashboard/favorites"
								className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
									isFavorites
										? "text-foreground bg-surface-hover"
										: "text-muted hover:text-foreground"
								}`}
							>
								Favorites
							</Link>
							<Link
								to="/dashboard/publisher/skills"
								className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
									isPublisher
										? "text-foreground bg-surface-hover"
										: "text-muted hover:text-foreground"
								}`}
							>
								Publisher
							</Link>
						</div>
					</div>

					{/* Right */}
					<div className="flex items-center gap-3">
						<ThemeToggle />
						<AuthButton />
					</div>
				</div>
			</nav>

			{/* Page content */}
			<main className="max-w-6xl mx-auto px-6 py-8">
				<Outlet />
			</main>
		</div>
	);
}
