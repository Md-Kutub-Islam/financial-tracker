import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";
const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  const expenses = await prisma.expense.findMany();
  res.json(expenses);
});

app.post("/expenses", async (req, res) => {
  const { title, amount, category } = req.body;
  const expense = await prisma.expense.create({
    data: { title, amount, category },
  });
  res.json(expense);
});

export default app;
