/**
 * Application configuration
 */

// Environment variables with fallbacks
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_UR || "10000"),
  },

  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "INVENTERA",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },
} as const;

// API helper
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl!.replace(/\/$/, "");
  const cleanEndpoint = endpoint.replace(/^\//, "");
  return `${baseUrl}/${cleanEndpoint}`;
};
