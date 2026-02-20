
export const ConfigValue = {
  API_URL: "/api/proxy", // Legacy proxy (kept for backward compat)
  FARM_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api",
  FRONT_URL: process.env.NEXT_PUBLIC_FRONT_URL,
  API_STORAGE_URL: process.env.NEXT_PUBLIC_API_STORAGE_URL,
  AUTH_USER_KEY: "farm-auth",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Farm Management",
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
};