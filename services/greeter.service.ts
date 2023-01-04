import type { Context, Service, ServiceSchema } from "moleculer";
import Moleculer from "moleculer";
import AppMixin from "../mixins/app.mixin";
import MoleculerError = Moleculer.Errors.MoleculerError;
import {serialize} from "cookie";

export interface ActionHelloParams {
	name: string;
}

interface Meta {
	userAgent?: string | null | undefined;
	user?: object | null | undefined; // User ctonaints Locale - use this and locale down below as fallback, use then application and then system as fallback locale
	locale?: object | null | undefined; // Accept Header locale
	version?: object | null | undefined; // X-Target-Version header
}

interface GreeterSettings {
	defaultName: string;
}

interface GreeterMethods {
	uppercase(str: string): string;
}

interface GreeterLocalVars {
	myVar: string;
}

type GreeterThis = Service<GreeterSettings> & GreeterMethods & GreeterLocalVars;

const GreeterService: ServiceSchema<GreeterSettings> = {
	name: "greeter",
	mixins: [AppMixin()],

	/**
	 * Settings
	 */
	settings: {
		defaultName: "Moleculer",
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		hello: {
			auth: true,
			deprecated: {
				since: "",
				forRemoval: false,
			},
			rest: {
				method: "GET",
				path: "/hello",
			},
			handler(this: GreeterThis, ctx: Context<null, any>): string {
				ctx.meta.$responseHeader = {"X-Custom": "yallah"};
				ctx.meta.$responseHeader["Set-Cookie"] = [serialize("cooked", String("tkkk"), {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 30,
					path: '/',
				})];
				return `Hello ${this.settings.defaultName}`;
			},
		},

		welcome: {
			rest: "GET /welcome/:name",
			params: {
				name: "string",
			},
			handler(this: GreeterThis, ctx: Context<ActionHelloParams>): string {
				throw new Moleculer.Errors.ValidationError("");
				//return `Welcome, ${ctx.params.name}`;
			},
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created(this: GreeterThis) {},

	/**
	 * Service started lifecycle event handler
	 */
	async started(this: GreeterThis) {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped(this: GreeterThis) {},
};

export default GreeterService;
