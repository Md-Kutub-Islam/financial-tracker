import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";

const prisma = new PrismaClient();

export const createCategory = AsyncHandler(async (req, res) => {
  const { name, type } = req.body;
  const userId = req.user?.userId;

  if (!name || !type) {
    throw new ApiError("Name and type are required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const category = await prisma.category.create({
    data: {
      name,
      type,
      user: {
        connect: { id: userId },
      },
    },
  });

  return ApiResponse.created(res, "Category created successfully", category);
});

export const getCategories = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
  });
  return ApiResponse.success(
    res,
    "Categories fetched successfully",
    categories
  );
});

export const getOneCategory = AsyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user?.userId;

  if (!categoryId) {
    throw new ApiError("Category ID is required", 400);
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new ApiError("Category not found", 404);
  }

  return ApiResponse.success(res, "Category fetched successfully", category);
});

export const updateCategory = AsyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name, type } = req.body;
  const userId = req.user?.userId;

  if (!categoryId) {
    throw new ApiError("Category ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!name && !type) {
    throw new ApiError("Name or type is required", 400);
  }

  // First check if the category exists and belongs to the user
  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
    },
  });

  if (!existingCategory) {
    throw new ApiError(
      "Category not found or you don't have permission to update it",
      404
    );
  }

  // Prepare update data - only include fields that are provided
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;

  const category = await prisma.category.update({
    where: { id: categoryId, userId },
    data: updateData,
  });

  return ApiResponse.success(res, "Category updated successfully", category);
});

export const deleteCategory = AsyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!categoryId) {
    throw new ApiError("Category ID is required", 400);
  }

  // Check if the category exists before attempting to delete
  const existingCategory = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existingCategory) {
    throw new ApiError("Category not found", 404);
  }

  const category = await prisma.category.delete({
    where: { id: categoryId, userId },
  });

  return ApiResponse.success(res, "Category deleted successfully", category);
});
