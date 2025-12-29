/**
 * Group feature types
 */

export type Group = {
  id: string;
  name: string;
  createdBy: string;
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
