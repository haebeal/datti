import type { User } from "@/features/user/types";

export type Group = {
	id: string;
	name: string;
	creator: User;
	createdAt: string;
	updatedAt: string;
};

export type GroupMember = {
	id: string;
	name: string;
	avatar: string;
	email: string;
};
