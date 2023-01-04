import {Service, ServiceSchema} from "moleculer";

type AppServiceSchema = Partial<ServiceSchema>;

export type AppServiceThis = Service;

export default function createDbServiceMixin(): AppServiceSchema {
	const schema: AppServiceSchema = {
		mixins: [],

		events: {

		},

		methods: {

		},

		/**
		 * Service created lifecycle event handler
		 */
		created(this: AppServiceThis) {
			this.logger.info("start app");
		},
	};

	return schema;
}
