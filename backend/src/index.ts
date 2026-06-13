import { Container, getRandom } from "@cloudflare/containers";

const INSTANCE_COUNT = 3;

export class BackendContainer extends Container {
	defaultPort = 8080;
	sleepAfter = "10m";
	enableInternet = true;
}

export interface Env {
	BACKEND: DurableObjectNamespace<BackendContainer>;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const container = await getRandom(env.BACKEND, INSTANCE_COUNT);
		return container.fetch(request);
	},
} satisfies ExportedHandler<Env>;
