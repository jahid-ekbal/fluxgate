import { format, formatDistanceToNow } from "date-fns";

export const formatDate = (value: Date | string) =>
  format(new Date(value), "MMM d, yyyy");

export const timeAgo = (value: Date | string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true });
