import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";
import userAuthRoute from "./routes/userAuthRoute.js";
import ApiError from "./utills/ApiError.js";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Test endpoint to verify Prisma connection
app.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const users = await prisma.user.findMany();
    res.json({
      message: "Server is running",
      categoriesCount: categories.length,
      usersCount: users.length,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/v1/auth", userAuthRoute);

// Simple error handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  res.status(500).json({ success: false, message: 'Server error', statusCode: 500 });
});

export default app;
