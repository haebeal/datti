import { HttpError } from "./HttpError";

export const fetcher = async <T>(
  path: string,
  accessToken: string | null | undefined,
): Promise<T> => {
  const response = await fetch(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer: ${accessToken}`,
    },
  });
  const result = await response.json();

  if (response.ok) {
    return result;
  }

  throw new HttpError(response);
};
