import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GATEWAY_API_URL =
  process.env.NEXT_PUBLIC_GATEWAY_API_URL || 'http://localhost:3001';

