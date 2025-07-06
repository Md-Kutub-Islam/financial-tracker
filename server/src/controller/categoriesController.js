import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";

const prisma = new PrismaClient();

export const createCategory = AsyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
  }
});

export const getCategories = AsyncHandler(async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return ApiResponse.success(
      res,
      200,
      "Categories fetched successfully",
      categories
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
  }
});

export const getOneCategory = AsyncHandler(async (req, res) => {
  try {
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

    return ApiResponse.success(
      res,
      200,
      "Category fetched successfully",
      category
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
  }
});

export const updateCategory = AsyncHandler(async (req, res) => {
  try {
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

    return ApiResponse.success(
      res,
      200,
      "Category updated successfully",
      category
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
});

export const deleteCategory = AsyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError("User not found", 404);
    }

    if (!categoryId) {
      throw new ApiError("Category ID is required", 400);
    }

    const category = await prisma.category.delete({
      where: { id: categoryId, userId },
    });

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    return ApiResponse.success(
      res,
      200,
      "Category deleted successfully",
      category
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode);
  }
});
