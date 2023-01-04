import type { Context, ServiceSchema } from "moleculer";
import type { ApiSettingsSchema, GatewayResponse, IncomingRequest, Route } from "moleculer-web";
import ApiGateway from "moleculer-web";
import AppMixin from "../mixins/app.mixin";
import {Service} from "moleculer";
import app from "../src/app";
import { serialize } from 'cookie';
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import versionMiddleware from "../middlewares/version.middleware";

import languageParser from "accept-language-parser";

interface Meta {
	userAgent?: string | null | undefined;
	user?: {id: string, username: string, roles: Map<string, string>} | null | undefined; // User ctonaints Locale - use this and locale down below as fallback, use then application and then system as fallback locale
	locale?: object | null | undefined; // Accept Header locale
	version?: object | null | undefined; // X-Target-Version header
}

const ApiService: ServiceSchema<ApiSettingsSchema> = {
	name: "api",
	mixins: [ApiGateway, AppMixin()],

	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		// Exposed port
		port: process.env.PORT != null ? Number(process.env.PORT) : 3000,

		// Exposed IP
		ip: "0.0.0.0",

		version: {
			min: "0.0.0",
			source: "1.0.0",
		},

		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [
			// @ts-ignore
			cookieParser(),
			helmet(),
			cors(),
			// @ts-ignore
			versionMiddleware,
		],

		routes: [
			{
				path: "/api",

				whitelist: ["**"],

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: false,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: true,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: true,

				aliases: {
					"GET ping": "api.ping",
				},

				/**
				 * Before call hook. You can check the request.
				 */
				onBeforeCall(
					ctx: Context<unknown, Meta>,
					route: Route,
					req: IncomingRequest,
					res: GatewayResponse,
				): void {
					// Set request headers to context meta
					ctx.meta.userAgent = req.headers["user-agent"];
				},

				/**
				 * After call hook. You can modify the data.
				 */
				onAfterCall(
					ctx: Context,
					route: Route,
					req: IncomingRequest,
					res: GatewayResponse,
					data: any,
				): any {

					// @ts-ignore
					const responseHeader: any = ctx.meta["$responseHeader"];
					if (responseHeader != null) {
						for (const [key, value] of Object.entries(responseHeader)) {
							res.setHeader(key, Array.isArray(value) ? value : String(value));
						}
					}

					// @ts-ignore
					/*
					const responseCookies: any = ctx.meta["$responseCookies"];
					if (Array.isArray(responseCookies) && responseCookies.length != 0) {
						res.setHeader("Set-Cookie", responseCookies);
					}
					if (responseCookies != null) {
						let cookies: any[] = [];
						for (const [key, value] of Object.entries(responseCookies)) {
							if (value != null) {
								cookies.push(serialize(key, String(value), {
									httpOnly: true,
									secure: process.env.NODE_ENV === 'production',
									sameSite: 'strict',
									maxAge: 60 * 60 * 24 * 30,
									path: '/',
								}));
							} else {

								// @ts-ignore
								cookies.push(serialize(key, null, {
									httpOnly: true,
									secure: process.env.NODE_ENV === 'production',
									sameSite: 'strict',
									maxAge: -1,
									path: '/',
								}));
							}
						}

					}
					 */

					return data;
				},

				// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
				callingOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: false,
			},
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {},
		},
	},

	actions: {
		ping: {
			auth: false,
			deprecated: {
				since: "",
				forRemoval: false,
			},
			rest: {
				method: "GET",
				path: "/ping",
			},
			handler(ctx: Context): string {
				return 'pong';
			},
		},
	},

	methods: {
		/**
		 * Authenticate the request. It check the `Authorization` token value in the request header.
		 * Check the token value & resolve the user by the token.
		 * The resolved user will be available in `ctx.meta.user`
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 */
		authenticate(
			ctx: Context,
			route: Route,
			req: IncomingRequest,
		): Record<string, unknown> | null {
			// Read the token from header
			const auth = req.headers.authorization;

			if (auth && auth.startsWith("Bearer")) {
				const token = auth.slice(7);

				// Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
				if (token === "123456") {
					// Returns the resolved user. It will be set to the `ctx.meta.user`
					return { id: 1, name: "John Doe" };
				}
				// Invalid token
				throw new ApiGateway.Errors.UnAuthorizedError(
					ApiGateway.Errors.ERR_INVALID_TOKEN,
					null,
				);
			} else {
				// No token. Throw an error or do nothing if anonymous access is allowed.
				// throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
				return null;
			}
		},

		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 */
		authorize(ctx: Context<null, Meta>, route: Route, req: IncomingRequest): Promise<Context<null, Meta>> {
			// Get the authenticated user.
			const { user } = ctx.meta;


			// TODO, if auth check if auth and in future check authorization if authorized
			this.logger.info('auth: ', req.$action.auth);
			this.logger.info('params: ', req.$params);

			const languages: languageParser.Language[] = languageParser.parse(req.headers["accept-language"]);
			if (languages.length !== 0) {
				ctx.meta.locale = {language: languages[0].code, country: languages[0].region};
				this.logger.info("lang: ", languages[0].code, languages[0].region);
			} else {
				ctx.meta.locale = {language: "en", country: "US"};
			}

			// @ts-ignore
			if (Object.keys(req["cookies"]).length !== 0) this.logger.info('cookies: ', req["cookies"]);

			return Promise.resolve(ctx);

			// It check the `auth` property in action schema.
			//if (req.$action.auth === "required" && !user) {
			//	throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS", null);
			//}
		},
	},
};

export default ApiService;
