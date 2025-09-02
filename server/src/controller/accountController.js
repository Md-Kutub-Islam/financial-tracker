import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";

const prisma = new PrismaClient();

export const createAccount = AsyncHandler(async (req, res) => {
  const { name, type, balance } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!name || !type || !balance) {
    throw new ApiError("All fields are required", 400);
  }

  const account = await prisma.account.create({
    data: { name, type, balance, userId },
  });

  if (!account) {
    throw new ApiError("Failed to create account", 500);
  }

  return ApiResponse.success(res, "Account created successfully", account);
});

export const getAccounts = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const accounts = await prisma.account.findMany({
    where: { userId },
  });
  return ApiResponse.success(res, "Accounts fetched successfully", accounts);
});

export const getOneAccount = AsyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!accountId) {
    throw new ApiError("Account ID is required", 400);
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new ApiError("Account not found", 404);
  }

  return ApiResponse.success(res, "Account fetched successfully", account);
});

export const updateAccount = AsyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const { name, type, balance } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!accountId) {
    throw new ApiError("Account ID is required", 400);
  }

  if (!name && !type && !balance) {
    throw new ApiError("At least one field is required", 400);
  }

  const account = await prisma.account.update({
    where: { id: accountId, userId },
    data: { name, type, balance },
  });

  if (!account) {
    throw new ApiError("Failed to update account", 500);
  }

  return ApiResponse.success(res, "Account updated successfully", account);
});

export const deleteAccount = AsyncHandler(async (req, res) => {
  const { accountId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!accountId) {
    throw new ApiError("Account ID is required", 400);
  }

  const account = await prisma.account.delete({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new ApiError("Failed to delete account", 500);
  }

  return ApiResponse.success(res, "Account deleted successfully", account);
});
