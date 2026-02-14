// Default to PRODUCTION if nothing is found
const ENV = process.env.EXPO_PUBLIC_ENVIRONMENT || "PRODUCTION";

const BASE_URL =
  ENV === "DEVELOPMENT"
    ? process.env.EXPO_PUBLIC_BASE_URL // local IP (e.g. 192.168...)
    : "https://bhhph.online"; // Hardcoded Production VPS

// Only use a port if we are explicitly in DEVELOPMENT
const PORT = ENV === "DEVELOPMENT" ? process.env.EXPO_PUBLIC_BACKEND_PORT : "";

const BASE = PORT ? `${BASE_URL}:${PORT}` : BASE_URL;

export default {
  BASE_URL: BASE,
};

console.log("Active Environment:", ENV);
console.log("Final Base Url:", BASE);
