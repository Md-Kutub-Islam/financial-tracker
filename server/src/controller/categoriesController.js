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

        if(!userId) {
            throw new ApiError("User not found", 404);
        }

        const category = await prisma.category.create({
            data: {
                name,
                type,
                user: {
                    connect: { id: userId }
                },
            }
        })

        res.status(201).json(new ApiResponse(201, "Category created successfully", category));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error", error.message));
    }
})


export const getCategories = AsyncHandler(async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json(new ApiResponse(200, "Categories fetched successfully", categories));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error", error.message));
    }
})

export const getOneCategory = AsyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id }
        })
        res.status(200).json(new ApiResponse(200, "Category fetched successfully", category));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error", error.message));
    }
})


export const updateCategory = AsyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;

        if(!id) {
            throw new ApiError("Category not found", 404);
        }

        if(!name && !type) {
            throw new ApiError("Name or type is required", 400);
        }

        const category = await prisma.category.update({
            where: { id },
            data: { name, type }
        })

        res.status(200).json(new ApiResponse(200, "Category updated successfully", category));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error", error.message));
    }
})

export const deleteCategory = AsyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.delete({
            where: { id }
        })
        res.status(200).json(new ApiResponse(200, "Category deleted successfully", category));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, "Internal server error", error.message));
    }
})
