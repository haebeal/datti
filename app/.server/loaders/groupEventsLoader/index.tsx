import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { authLoader } from "~/.server/loaders/authLoader";
import { createDattiClient } from "~/lib/apiClient";

export const groupEventsLoader = async ({
  request,
  params,
  context,
}: LoaderFunctionArgs) => {
  console.log("start groupEventsLoader");
  const start = performance.now();

  const groupId = params.id;

  if (!groupId) {
    throw new Error("Not Found Group");
  }

  const auth = await authLoader({
    request,
    params,
    context,
  });
  const { idToken } = await auth.json();

  const dattiClient = createDattiClient(
    idToken,
    context.cloudflare.env.BACKEND_ENDPOINT
  );

  const { events } = await dattiClient.groups._groupId(groupId).events.$get();

  const end = performance.now();
  console.log(`end groupEventsLoader at ${end - start}ms`);

  if (events === null) {
    return {
      events: [] satisfies Event[],
    };
  }

  return {
    events,
  };
};

export type GroupEventsLoader = typeof groupEventsLoader;
