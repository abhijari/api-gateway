import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NOTE: GATEWAY_API_URL used to be exported here as a build-time constant
// (NEXT_PUBLIC_GATEWAY_API_URL). We intentionally remove that export so the
// dashboard no longer depends on a build-time environment variable. The app
// now reads the gateway URL at runtime from the `/api/runtime-config` route.

