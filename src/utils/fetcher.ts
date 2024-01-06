import { HttpError } from "@/errors";

export const fetcher = async <T extends object>(
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
  console.log(response);

  if (response.ok) {
    const result = await response.json();
    return result;
  }

  throw new HttpError(response);
};
