import dotenv from "dotenv";
import path from "path";

// Determine which .env file to load based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production.local"
    : ".env.development.local";

// Load the appropriate .env file
const result = dotenv.config({
  path: path.resolve(__dirname, `../${envFile}`),
});

// Debug: Check if .env file was loaded
if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("Loaded .env file:", envFile);
  console.log("MONGODB_URI from process.env:", process.env.MONGODB_URI);
}

// Export environment variables with type safety
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/myapp",
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  // Cookie
  COOKIE_SECRET: process.env.COOKIE_SECRET || "your-cookie-secret",
} as const;

// Type guard to check if we're in production
export const isProduction = env.NODE_ENV === "production";
