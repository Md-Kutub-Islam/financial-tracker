import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";

const prisma = new PrismaClient();

export const createBudget = AsyncHandler(async (req, res) => {
  const { amount, startDate, endDate, categoryId } = req.body;
  const userId = req.user?.userId;

  if (!amount || !startDate || !endDate || !categoryId) {
    throw new ApiError("All fields are required", 400);
  }

  if (startDate > endDate) {
    throw new ApiError("Start date must be before end date", 400);
  }

  if (!categoryId) {
    throw new ApiError("Category ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const budget = await prisma.budget.create({
    data: { amount, startDate, endDate, userId, categoryId },
  });

  if (!budget) {
    throw new ApiError("Failed to create budget", 500);
  }

  return ApiResponse.created(res, "Budget created successfully", budget);
});

export const getBudgets = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { startDate, endDate, categoryId } = req.query;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (startDate || endDate || categoryId) {
    budgets = await prisma.budget.findMany({
      where: { userId, startDate, endDate, categoryId },
    });
  } else {
    budgets = await prisma.budget.findMany({
      where: { userId },
    });
  }

  return ApiResponse.success(res, "Budgets fetched successfully", budgets);
});

export const getOneBudget = AsyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user?.userId;

  if (!budgetId) {
    throw new ApiError("Budget ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const budget = await prisma.budget.findUnique({
    where: { id: budgetId, userId },
  });

  if (!budget) {
    throw new ApiError("Budget not found", 404);
  }

  return ApiResponse.success(res, "Budget fetched successfully", budget);
});

export const updateBudget = AsyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const { amount, startDate, endDate, categoryId } = req.body;
  const userId = req.user?.userId;

  if (!budgetId) {
    throw new ApiError("Budget ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!amount && !startDate && !endDate && !categoryId) {
    throw new ApiError("At least one field is required", 400);
  }

  const budget = await prisma.budget.update({
    where: { id: budgetId, userId },
    data: { amount, startDate, endDate, categoryId },
  });

  if (!budget) {
    throw new ApiError("Failed to update budget", 500);
  }

  return ApiResponse.success(res, "Budget updated successfully", budget);
});

export const deleteBudget = AsyncHandler(async (req, res) => {
  const { budgetId } = req.params;
  const userId = req.user?.userId;

  if (!budgetId) {
    throw new ApiError("Budget ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const budget = await prisma.budget.delete({
    where: { id: budgetId, userId },
  });

  return ApiResponse.success(res, "Budget deleted successfully", budget);
});
