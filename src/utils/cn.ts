import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
  // clsx handles conditional logic and arrays/objects
  const className = clsx(...inputs);

  // twMerge resolves Tailwind conflicts and returns a string
  return twMerge(className);
}
