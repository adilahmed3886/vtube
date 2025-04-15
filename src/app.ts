import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "process";
import path from "path";
import userRouter from "./routes/user.routes";
import videoRouter from "./routes/video.routes";

const app = express();

//configuration
app.use(express.json());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../public/temp")));
app.use(cookieParser());

//routes
app.use("/api/v1/user", userRouter)
app.use("/api/v1/video", videoRouter)



export default app;