import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),
	route("cli/auth", "routes/cli.auth.tsx"),
	route("api/auth/*", "routes/api.auth.$.tsx"),
	route("api/auth/device/code", "routes/api.auth.device.code.tsx"),
	route("api/auth/device/exchange", "routes/api.auth.device.exchange.tsx"),

	// Dashboard routes
	layout("routes/dashboard.tsx", [
		route("dashboard/skills", "routes/dashboard.skills.tsx"),
		layout("routes/dashboard.publisher.tsx", [
			route("dashboard/publisher/skills", "routes/dashboard.publisher.skills.tsx"),
			route("dashboard/publisher/skills/:id", "routes/dashboard.publisher.skills.$id.tsx"),
			route("dashboard/publisher/orgs/:orgId", "routes/dashboard.publisher.orgs.$orgId.tsx"),
		]),
	]),
] satisfies RouteConfig;
