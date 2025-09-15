import { Container, getRandom } from "@cloudflare/containers";
import {env} from "cloudflare:workers"

export class BackendContainer extends Container<Env> {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "30s";
  // Environment variables passed to the container
  envVars = {
    DSN: env.DSN,
    PORT: "8080"
  };

  // Optional lifecycle hooks
  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }

  override onError(error: unknown) {
    console.log("Container error:", error);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // note: "getRandom" to be replaced with latency-aware routing in the near future
    const containerInstance = await getRandom(env.BACKEND_CONTAINER, 3);
    return await containerInstance.fetch(request);
  },
};
