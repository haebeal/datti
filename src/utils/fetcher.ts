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
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    const result = await response.json();
    return result;
  }

  throw new HttpError(response);
};
