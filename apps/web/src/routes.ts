import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/_index.tsx"),
	route("cli/auth", "routes/cli.auth.tsx"),
	route("api/auth/*", "routes/api.auth.$.tsx"),
	route("api/auth/device/code", "routes/api.auth.device.code.tsx"),
	route("api/auth/device/confirm", "routes/api.auth.device.confirm.tsx"),
	route("api/auth/device/poll", "routes/api.auth.device.poll.tsx"),
] satisfies RouteConfig;
