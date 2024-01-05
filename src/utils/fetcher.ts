import { HttpError } from "@/errors";

export const fetcher = async <T extends object>(
  path: string,
  accessToken: string | null | undefined,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Partial<T>,
): Promise<T> => {
  const response = await fetch(path, {
    method: method,
    headers: {
      Authorization: `Bearer: ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (response.ok) {
    return result;
  }

  throw new HttpError(response);
};
