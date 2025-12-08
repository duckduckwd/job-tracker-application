/**
 * Format utilities for common data transformations
 */

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
