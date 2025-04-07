import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production.local"
    : ".env.development.local";

const result = dotenv.config({
  path: path.resolve(__dirname, `../${envFile}`),
});

if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log("Loaded .env file:", envFile);
  console.log("MONGODB_URI from process.env:", process.env.MONGODB_URI);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/myapp",
  // JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "your-secret-key",
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  // Cookie
  COOKIE_SECRET: process.env.COOKIE_SECRET || "your-cookie-secret",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
} as const;

export const isProduction = env.NODE_ENV === "production";

// import { z } from "zod";
// import dotenv from "dotenv";

// // Load .env file
// dotenv.config();

// // Define schema for environment variables
// const envSchema = z.object({
//   NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
//   PORT: z.string().default("3000").transform(Number), // Ensures PORT is a number
//   MONGODB_URI: z.string().url(), // Ensures it's a valid URL
//   JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
//   JWT_EXPIRES_IN: z.string().default("7d"),
//   CLOUDINARY_CLOUD_NAME: z.string().optional(), // Not required
//   CLOUDINARY_API_KEY: z.string().optional(),
//   CLOUDINARY_API_SECRET: z.string().optional(),
//   COOKIE_SECRET: z.string().default("your-cookie-secret"),
// });

// // Parse and validate process.env
// export const env = envSchema.parse(process.env);
