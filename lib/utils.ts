import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const format = (str: string | null | undefined, options: Intl.DateTimeFormatOptions): string => {
  if (!str) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", options).format(new Date(str));
  } catch {
    return str;
  }
};

export const formatDate = (s: string | null | undefined) =>
  format(s, { month: "short", day: "numeric", year: "numeric" });

export const formatDateTime = (s: string | null | undefined) =>
  format(s, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

export const formatTime = (s: string | null | undefined) =>
  format(s, { hour: "numeric", minute: "2-digit", hour12: true });
