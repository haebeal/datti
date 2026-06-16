import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export class BackendContainer extends Container<Env> {
	defaultPort = 8080;
	sleepAfter = "10m";
	enableInternet = true;

	constructor(...args: ConstructorParameters<typeof Container<Env>>) {
		super(...args);
		const [, env] = args;
		// Worker の bindings (wrangler.toml の [vars] + wrangler secret) を
		// すべてそのまま Container プロセスの環境変数として渡す。
		// DurableObjectNamespace のような string でない binding は除外する。
		this.envVars = Object.fromEntries(
			Object.entries(env).filter(
				([, value]) => typeof value === "string",
			) as [string, string][],
		);
	}
}

export interface Env {
	BACKEND: DurableObjectNamespace<BackendContainer>;
	[key: string]: unknown;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const container = await getRandom(env.BACKEND, INSTANCE_COUNT);
		return container.fetch(request);
	},
} satisfies ExportedHandler<Env>;
