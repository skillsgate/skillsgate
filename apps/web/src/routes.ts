import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),
	route("cli/auth", "routes/cli.auth.tsx"),
	route("api/auth/*", "routes/api.auth.$.tsx"),
	route("api/github/authorize", "routes/api.github.authorize.tsx"),
	route("api/github/callback", "routes/api.github.callback.tsx"),
	route("api/auth/device/code", "routes/api.auth.device.code.tsx"),
	route("api/auth/device/exchange", "routes/api.auth.device.exchange.tsx"),

	// Skill detail (splat for multi-segment paths like /skills/owner/repo/name)
	route("skills/*", "routes/skills.$.tsx"),

	// Dashboard routes
	layout("routes/dashboard.tsx", [
		route("dashboard", "routes/dashboard._index.tsx"),
		route("dashboard/skills", "routes/dashboard.skills.tsx"),
		route("dashboard/favorites", "routes/dashboard.favorites.tsx"),
		layout("routes/dashboard.publisher.tsx", [
			route("dashboard/publisher/skills", "routes/dashboard.publisher.skills.tsx"),
			route("dashboard/publisher/skills/new", "routes/dashboard.publisher.skills.new.tsx"),
			route("dashboard/publisher/skills/:id", "routes/dashboard.publisher.skills.$id.tsx"),
			route("dashboard/publisher/repos", "routes/dashboard.publisher.repos.tsx"),
			route("dashboard/publisher/repos/connect", "routes/dashboard.publisher.repos.connect.tsx"),
			route("dashboard/publisher/orgs/:orgId", "routes/dashboard.publisher.orgs.$orgId.tsx"),
		]),
	]),
] satisfies RouteConfig;
