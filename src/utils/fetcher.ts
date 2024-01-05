import { HttpError } from "@/errors";

export const fetcher = async <T>(
  path: string,
  accessToken: string | null | undefined,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
): Promise<T> => {
  const response = await fetch(path, {
    method: method,
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
