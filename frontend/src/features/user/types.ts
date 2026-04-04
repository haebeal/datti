/**
 * User feature types
 */

export type User = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  lineUserId?: string | null;
};

export type Subscription = {
  channel: "line";
  eventFiring: boolean;
  weeklySummary: boolean;
};
