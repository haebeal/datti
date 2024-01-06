import { HttpError } from "@/errors";

export const fetcher = async <T extends object, U = unknown>(
  path: string,
  accessToken: string | null | undefined,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Partial<T> | U,
): Promise<T> => {
  const response = await fetch(path, {
    method: method,
    headers: accessToken
      ? {
          Authorization: `Bearer: ${accessToken}`,
        }
      : undefined,
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const result = await response.json();
    return result;
  }

  throw new HttpError(response);
};
