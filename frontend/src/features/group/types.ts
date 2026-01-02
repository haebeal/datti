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
  creator: User;
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupRequest = {
  name: string;
};

export type UpdateGroupRequest = {
  name: string;
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
