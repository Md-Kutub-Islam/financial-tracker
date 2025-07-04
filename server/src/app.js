import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";

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


export default app;
