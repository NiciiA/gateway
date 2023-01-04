import {Initializable} from "./utils/initializable";

class App implements Initializable {

	private _version: { min: string; source: string; } | undefined;
	private _initialized: boolean = false;

	public init(arg?: {version: {min: string, source: string}}): Promise<void> {
		if (!this._initialized) {
			if (arg) this._version = arg.version;
			console.log("init app");
			this._initialized = true;
		}

		return Promise.resolve();
	}

}

export default new App();
