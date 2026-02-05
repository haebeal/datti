/**
 * Group feature types
 */

import type { User } from "@/features/user/types";

/**
 * Backend API response type
 */
export type GroupResponse = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Frontend Group type with creator information
 */
export type Group = {
  id: string;
  name: string;
  description: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupRequest = {
  name: string;
  description?: string;
};

export type UpdateGroupRequest = {
  name: string;
  description?: string;
};

export type GroupMember = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

export type AddMemberRequest = {
  userId: string;
};
