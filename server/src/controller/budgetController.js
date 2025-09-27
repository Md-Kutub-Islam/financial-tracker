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

export const monthlyBudetsSetup = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { monthlyAmount, startDate, endDate } = req.body;

  if (!monthlyAmount || !startDate || !endDate || startDate > endDate) {
    throw new ApiError(
      "Monthly amount, start date and end date are required and start date must be before end date",
      400
    );
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const budgets = await prisma.budget.create({
    data: {
      monthlyAmount: monthlyAmount,
      startDate,
      endDate,
      userId,
    },
  });

  return ApiResponse.success(
    res,
    "Monthly budgets setup successfully",
    budgets
  );
});

export const getBudgetSummary = AsyncHandler(async (req, res) => {
  const { startDate: reqStartDate, endDate: reqEndDate } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  // Create proper date range for the current month only
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based month (0 = January, 11 = December)

  // Use provided dates or default to current month
  let startDate, endDate;
  if (reqStartDate && reqEndDate) {
    startDate = new Date(reqStartDate);
    endDate = new Date(reqEndDate);
  } else {
    startDate = new Date(year, month, 1); // First day of current month
    endDate = new Date(year, month + 1, 0); // Last day of current month
  }

  // Execute all queries in parallel for better performance
  const [budgets, expenseTransactions, monthlyBudget, categoryExpenses] =
    await Promise.all([
      // Get all budgets for the current month
      prisma.budget.findMany({
        where: {
          userId,
          startDate: { gte: startDate },
          endDate: { lte: endDate },
        },
        include: {
          category: {
            select: { name: true, type: true },
          },
        },
      }),

      // Get expense transactions for the current month with aggregation
      prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
          type: "expense",
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Get monthly budget setup for current month
      prisma.budget.findFirst({
        where: {
          userId,
          startDate: { gte: startDate },
          endDate: { lte: endDate },
          monthlyAmount: { not: null },
        },
      }),

      // Get expense transactions grouped by category
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
          type: "expense",
          categoryId: { not: null },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

  // Calculate totals
  const totalBudgetAmount = budgets.reduce(
    (acc, budget) => acc + (budget.amount || 0),
    0
  );
  const totalExpenses = expenseTransactions._sum.amount || 0;
  const expenseCount = expenseTransactions._count.id || 0;
  const monthlyBudgetAmount = monthlyBudget?.monthlyAmount || 0;

  // Calculate remaining budget
  const remainingBudget = monthlyBudgetAmount - totalExpenses;
  const budgetUtilization =
    monthlyBudgetAmount > 0 ? (totalExpenses / monthlyBudgetAmount) * 100 : 0;

  // Get category names for expenses
  const categoryIds = [
    ...new Set(categoryExpenses.map((exp) => exp.categoryId)),
  ];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, type: true },
  });

  // Create category lookup map
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = { name: cat.name, type: cat.type };
    return acc;
  }, {});

  // Group budgets by category for chart data
  const budgetByCategory = budgets.reduce((acc, budget) => {
    const categoryName = budget.category?.name || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = {
        budgetAmount: 0,
        expenseAmount: 0,
        categoryType: budget.category?.type || "expense",
      };
    }
    acc[categoryName].budgetAmount += budget.amount || 0;
    return acc;
  }, {});

  // Add expense amounts to categories
  categoryExpenses.forEach((expense) => {
    const category = categoryMap[expense.categoryId];
    if (category) {
      const categoryName = category.name;
      if (!budgetByCategory[categoryName]) {
        budgetByCategory[categoryName] = {
          budgetAmount: 0,
          expenseAmount: 0,
          categoryType: category.type,
        };
      }
      budgetByCategory[categoryName].expenseAmount += expense._sum.amount || 0;
    }
  });

  // Structure data for frontend charts
  const budgetSummary = {
    summary: {
      totalMonthlyBudget: monthlyBudgetAmount,
      totalBudgetAmount: totalBudgetAmount,
      totalExpenses: totalExpenses,
      remainingBudget: remainingBudget,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100, // Round to 2 decimal places
      expenseCount: expenseCount,
    },
    chartData: {
      budgetByCategory: Object.entries(budgetByCategory).map(
        ([category, data]) => ({
          category,
          budgetAmount: data.budgetAmount,
          expenseAmount: data.expenseAmount,
          type: data.categoryType,
          remaining: data.budgetAmount - data.expenseAmount,
          utilization:
            data.budgetAmount > 0
              ? Math.round(
                  (data.expenseAmount / data.budgetAmount) * 100 * 100
                ) / 100
              : 0,
        })
      ),
      monthlyOverview: {
        budget: monthlyBudgetAmount,
        expenses: totalExpenses,
        remaining: remainingBudget,
      },
    },
    timeRange: {
      year: year,
      month: month + 1, // Convert to 1-based month for display
      monthName: currentDate.toLocaleString("default", { month: "long" }),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };

  return ApiResponse.success(
    res,
    "Budget summary fetched successfully",
    budgetSummary
  );
});
