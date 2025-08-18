import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";

const prisma = new PrismaClient();

export const createTransaction = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { name, amount, date, type, description, categoryId } = req.body;

  if (!name || !amount || !type) {
    throw new ApiError("Name, amount, and type are required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  // Validate categoryId if provided
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: userId,
      },
    });

    if (!category) {
      throw new ApiError("Category not found or does not belong to you", 404);
    }
  }

  const transaction = await prisma.transaction.create({
    data: {
      name,
      amount,
      date: date || new Date(),
      type,
      userId,
      description,
      categoryId,
    },
  });

  return ApiResponse.created(
    res,
    "Transaction created successfully",
    transaction
  );
});

export const getTransactions = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { startDate, endDate, categoryId, type } = req.query;

  let transactions;

  if (startDate || endDate || categoryId || type) {
    transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        categoryId,
        type,
      },
    });
  } else {
    transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
    });
  }

  return ApiResponse.success(
    res,
    "Transactions fetched successfully",
    transactions
  );
});

export const getOneTransaction = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { transactionId } = req.params;

  if (!transactionId) {
    throw new ApiError("Transaction ID is required", 400);
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    throw new ApiError("Transaction not found", 404);
  }

  return ApiResponse.success(
    res,
    "Transaction fetched successfully",
    transaction
  );
});

export const updateTransaction = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { transactionId } = req.params;
  const { name, amount, date, type, description, accountId, categoryId } =
    req.body;

  if (!name && !date && !type && !description && !accountId && !categoryId) {
    throw new ApiError("At least one field is required", 400);
  }

  if (!transactionId) {
    throw new ApiError("Transaction ID is required", 400);
  }

  const existingTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId, userId },
  });

  if (!existingTransaction) {
    throw new ApiError("Transaction not found", 404);
  }

  const updateTransaction = {};

  if (name) {
    updateTransaction.name = name;
  }

  if (date) {
    updateTransaction.date = date;
  }

  if (type) {
    updateTransaction.type = type;
  }

  if (description) {
    updateTransaction.description = description;
  }

  if (amount) {
    updateTransaction.amount = amount;
  }

  if (categoryId) {
    updateTransaction.categoryId = categoryId;
  }

  if (accountId) {
    updateTransaction.accountId = accountId;
  }

  const transaction = await prisma.transaction.update({
    where: { id: transactionId, userId },
    data: updateTransaction,
  });

  return ApiResponse.success(
    res,
    "Transaction updated successfully",
    transaction
  );
});

export const deleteTransaction = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { transactionId } = req.params;

  if (!transactionId) {
    throw new ApiError("Transaction ID is required", 400);
  }

  const existingTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId, userId },
  });

  if (!existingTransaction) {
    throw new ApiError("Transaction not found", 404);
  }

  const transaction = await prisma.transaction.delete({
    where: { id: transactionId, userId },
  });
  return ApiResponse.success(
    res,
    "Transaction deleted successfully",
    transaction
  );
});
