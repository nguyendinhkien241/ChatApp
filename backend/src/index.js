import express from "express";
import dotenv from "dotenv";
import authRouters from "./routes/auth.router.js";
import messageRouters from "./routes/message.router.js";
import connectDB from "./lib/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from './lib/socket.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouters);
app.use("/api/messages", messageRouters);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
