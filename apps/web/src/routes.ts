import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),
	route("cli/auth", "routes/cli.auth.tsx"),
	route("api/auth/*", "routes/api.auth.$.tsx"),
	route("api/auth/device/code", "routes/api.auth.device.code.tsx"),
	route("api/auth/device/exchange", "routes/api.auth.device.exchange.tsx"),
] satisfies RouteConfig;
