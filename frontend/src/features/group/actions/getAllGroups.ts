"use server";

import { apiClient } from "@/libs/api/client";
import type { Result } from "@/schema";
import type { Group } from "../types";

export async function getAllGroups(): Promise<Result<Group[]>> {
  try {
    const response = await apiClient.get<Group[]>("/groups");
    return {
      success: true,
      result: response,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
