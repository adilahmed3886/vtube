import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "process";
import path from "path";
const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());



export default app;