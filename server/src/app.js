import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "./generated/prisma/index.js";
import userAuthRoute from "./routes/userAuthRoute.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import ApiError from "./utills/ApiError.js";

const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.json());
app.use(cookieParser());

// Test endpoint to verify Prisma connection
app.get("/", async (_, res) => {
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

// Test endpoint for error handling demonstration
app.get("/test-errors", (req, res, next) => {
  const errorType = req.query.type || "generic";

  switch (errorType) {
    case "validation":
      throw new ApiError("Validation failed: Invalid input data", 400);
    case "notfound":
      throw ApiError.notFound("User not found");
    case "unauthorized":
      throw ApiError.unauthorized("Access denied");
    case "prisma":
      // Simulate a Prisma error
      const prismaError = new Error("Unique constraint failed");
      prismaError.code = "P2002";
      prismaError.meta = { target: ["email"] };
      throw prismaError;
    case "database":
      // Simulate a database connection error
      const dbError = new Error("Connection timeout");
      dbError.code = "P1001";
      throw dbError;
    default:
      throw new Error("Generic error for testing");
  }
});

app.use("/api/v1/auth", userAuthRoute);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/budgets", budgetRoutes);
// Enhanced error handler
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Prisma errors
  if (err.code && err.meta) {
    // Prisma validation errors
    if (err.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: `Duplicate entry: ${
          err.meta.target?.join(", ") || "field already exists"
        }`,
        statusCode: 400,
      });
    }

    // Prisma record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        statusCode: 404,
      });
    }

    // Prisma foreign key constraint
    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Invalid reference: related record does not exist",
        statusCode: 400,
      });
    }

    // Other Prisma errors
    return res.status(400).json({
      success: false,
      message: `Database error: ${err.message}`,
      statusCode: 400,
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message || "Validation error",
      statusCode: 400,
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
      statusCode: 400,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      statusCode: 401,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      statusCode: 401,
    });
  }

  // Handle other known errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "An error occurred",
      statusCode: err.statusCode,
    });
  }

  // Default error handler - provide more details in development
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(500).json({
    success: false,
    message: isDevelopment ? err.message : "Internal server error",
    statusCode: 500,
    ...(isDevelopment && { stack: err.stack }),
  });
});

export default app;
