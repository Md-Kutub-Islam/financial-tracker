import { PrismaClient } from "../generated/prisma/index.js";
import AsyncHandler from "../utills/AsynHandler.js";
import ApiResponse from "../utills/ApiResponse.js";
import ApiError from "../utills/ApiError.js";

const prisma = new PrismaClient();

export const createBudget = AsyncHandler(async (req, res) => {
  const { expenseAmount, startDate, endDate, categoryId, monthlyAmount } =
    req.body;
  const userId = req.user?.userId;

  let budget;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (startDate > endDate) {
    throw new ApiError("Start date must be before end date", 400);
  }

  if (!categoryId) {
    throw new ApiError("Category ID is required", 400);
  }

  if (expenseAmount) {
    if (!expenseAmount || !startDate || !endDate || !categoryId) {
      throw new ApiError("All fields are required", 400);
    }

    budget = await prisma.budget.create({
      data: { expenseAmount, startDate, endDate, userId, categoryId },
    });
  } else {
    if (!monthlyAmount || !startDate || !endDate) {
      throw new ApiError("All fields are required", 400);
    }

    budget = await prisma.budget.create({
      data: { monthlyAmount, startDate, endDate, userId, categoryId },
    });
  }

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
  const { expenseAmount, startDate, endDate, categoryId, monthlyAmount } =
    req.body;
  const userId = req.user?.userId;

  let budget;

  if (!budgetId) {
    throw new ApiError("Budget ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!categoryId) {
    throw new ApiError("Category ID is required", 400);
  }

  if (
    !expenseAmount &&
    !startDate &&
    !endDate &&
    !categoryId &&
    !monthlyAmount
  ) {
    throw new ApiError("At least one field is required", 400);
  }

  if (expenseAmount) {
    budget = await prisma.budget.update({
      where: { id: budgetId, userId },
      data: { expenseAmount, startDate, endDate, categoryId },
    });
  } else {
    budget = await prisma.budget.update({
      where: { id: budgetId, userId },
      data: { monthlyAmount, startDate, endDate },
    });
  }

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

// Monthly budget setup
export const monthlyBudetsSetup = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { amount, startDate, endDate } = req.body;

  if (!amount && !startDate && !endDate && startDate > endDate) {
    throw new ApiError(
      "Monthly amount, start date and end date are required and start date must be before end date",
      400
    );
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const monthlyBudget = await prisma.monthlyBudget.create({
    data: {
      amount,
      startDate,
      endDate,
      userId,
    },
  });

  return ApiResponse.success(
    res,
    "Monthly budget setup successfully",
    monthlyBudget
  );
});

export const getMonthlyBudgets = AsyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const monthlyBudgets = await prisma.monthlyBudget.findMany({
    where: { userId },
  });

  return ApiResponse.success(
    res,
    "Monthly budgets fetched successfully",
    monthlyBudgets
  );
});

export const updateMonthlyBudget = AsyncHandler(async (req, res) => {
  const { monthlyBudgetId } = req.params;
  const { amount, startDate, endDate } = req.body;
  const userId = req.user?.userId;

  if (!monthlyBudgetId) {
    throw new ApiError("Monthly budget ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  if (!amount && !startDate && !endDate) {
    throw new ApiError("At least one field is required", 400);
  }

  const monthlyBudget = await prisma.monthlyBudget.update({
    where: { id: monthlyBudgetId, userId },
    data: { amount, startDate, endDate },
  });

  return ApiResponse.success(
    res,
    "Monthly budget updated successfully",
    monthlyBudget
  );
});

export const deleteMonthlyBudget = AsyncHandler(async (req, res) => {
  const { monthlyBudgetId } = req.params;
  const userId = req.user?.userId;

  if (!monthlyBudgetId) {
    throw new ApiError("Monthly budget ID is required", 400);
  }

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  const monthlyBudget = await prisma.monthlyBudget.delete({
    where: { id: monthlyBudgetId, userId },
  });

  return ApiResponse.success(
    res,
    "Monthly budget deleted successfully",
    monthlyBudget
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

// Monthly budget summary
export const getMonthlyBudgetSummary = AsyncHandler(async (req, res) => {
  // Check both req.body and req.query to support both POST and GET requests
  const reqStartDate = req.body?.reqStartDate || req.query?.reqStartDate;
  const reqEndDate = req.body?.reqEndDate || req.query?.reqEndDate;
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError("User not found", 404);
  }

  // Create proper date range - use provided dates or default to current month
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based month (0 = January, 11 = December)

  let startDate, endDate;
  if (reqStartDate && reqEndDate) {
    startDate = new Date(reqStartDate);
    endDate = new Date(reqEndDate);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ApiError("Invalid date format", 400);
    }

    if (startDate > endDate) {
      throw new ApiError("Start date must be before or equal to end date", 400);
    }
  } else {
    startDate = new Date(year, month, 1); // First day of current month
    endDate = new Date(year, month + 1, 0); // Last day of current month
  }

  // Get MonthlyBudget amounts that overlap with the date range
  const monthlyBudgets = await prisma.monthlyBudget.findMany({
    where: {
      userId,
      // Budget period overlaps with requested date range
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: {
      id: true,
      amount: true,
      startDate: true,
      endDate: true,
    },
  });

  // Get Budget monthlyAmount and expenseAmount values that overlap with the date range, including category info
  const budgets = await prisma.budget.findMany({
    where: {
      userId,
      // Budget period overlaps with requested date range
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      OR: [{ monthlyAmount: { not: null } }, { expenseAmount: { not: null } }],
    },
    select: {
      id: true,
      monthlyAmount: true,
      expenseAmount: true,
      startDate: true,
      endDate: true,
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      categoryId: true,
    },
  });

  // Calculate totals
  const totalMonthlyBudgetAmount = monthlyBudgets.reduce(
    (sum, mb) => sum + (mb.amount || 0),
    0
  );

  const totalBudgetMonthlyAmount = budgets.reduce(
    (sum, b) => sum + (b.monthlyAmount || 0),
    0
  );

  const totalExpenseAmount = budgets.reduce(
    (sum, b) => sum + (b.expenseAmount || 0),
    0
  );

  // Group budgets by category and prepare chart data
  const categoryBudgetMap = {};
  budgets.forEach((budget) => {
    const categoryName = budget.category?.name || "Uncategorized";
    const categoryId = budget.categoryId || "uncategorized";

    if (!categoryBudgetMap[categoryId]) {
      categoryBudgetMap[categoryId] = {
        categoryId: categoryId,
        categoryName: categoryName,
        categoryType: budget.category?.type || "expense",
        totalMonthlyAmount: 0,
        totalExpenseAmount: 0,
      };
    }

    categoryBudgetMap[categoryId].totalMonthlyAmount +=
      budget.monthlyAmount || 0;
    categoryBudgetMap[categoryId].totalExpenseAmount +=
      budget.expenseAmount || 0;
  });

  // Convert to array and calculate percentages and status
  const categoryBudgets = Object.values(categoryBudgetMap).map((category) => {
    // Calculate what percentage this category takes from the monthly budget
    const percentageOfMonthly =
      totalMonthlyBudgetAmount > 0
        ? (category.totalMonthlyAmount / totalMonthlyBudgetAmount) * 100
        : 0;

    // Calculate expense amount percentage of monthly budget
    const expensePercentageOfMonthly =
      totalMonthlyBudgetAmount > 0
        ? (category.totalExpenseAmount / totalMonthlyBudgetAmount) * 100
        : 0;

    // Calculate expense vs category budget percentage
    const expenseVsBudgetPercentage =
      category.totalMonthlyAmount > 0
        ? (category.totalExpenseAmount / category.totalMonthlyAmount) * 100
        : 0;

    // Calculate remaining budget after expenses
    const remainingBudget =
      category.totalMonthlyAmount - category.totalExpenseAmount;

    // Status: check if expenses are within the category budget
    const isExpenseWithinBudget =
      category.totalExpenseAmount <= category.totalMonthlyAmount;

    return {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      categoryType: category.categoryType,
      monthlyAmount: category.totalMonthlyAmount,
      expenseAmount: category.totalExpenseAmount,
      percentageOfMonthly: Math.round(percentageOfMonthly * 100) / 100,
      expensePercentageOfMonthly:
        Math.round(expensePercentageOfMonthly * 100) / 100,
      expenseVsBudgetPercentage:
        Math.round(expenseVsBudgetPercentage * 100) / 100,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      status:
        category.totalMonthlyAmount <= totalMonthlyBudgetAmount
          ? "within_limit"
          : "over_limit",
      expenseStatus: isExpenseWithinBudget ? "within_budget" : "over_budget",
    };
  });

  // Prepare chart data
  const chartData = {
    // Pie chart data - category budget distribution
    pieChart: categoryBudgets.map((cat) => ({
      name: cat.categoryName,
      value: cat.monthlyAmount,
      percentage: cat.percentageOfMonthly,
      color: cat.status === "within_limit" ? "#10b981" : "#ef4444", // green if within, red if over
    })),

    // Pie chart data - expense distribution
    expensePieChart: categoryBudgets.map((cat) => ({
      name: cat.categoryName,
      value: cat.expenseAmount,
      percentage: cat.expensePercentageOfMonthly,
      color: cat.expenseStatus === "within_budget" ? "#10b981" : "#ef4444", // green if within, red if over
    })),

    // Bar chart data - category budget vs monthly budget
    barChart: categoryBudgets.map((cat) => ({
      category: cat.categoryName,
      categoryBudget: cat.monthlyAmount,
      monthlyBudget: totalMonthlyBudgetAmount,
      percentage: cat.percentageOfMonthly,
      status: cat.status,
    })),

    // Bar chart data - expense vs budget comparison
    expenseBarChart: categoryBudgets.map((cat) => ({
      category: cat.categoryName,
      expenseAmount: cat.expenseAmount,
      categoryBudget: cat.monthlyAmount,
      remainingBudget: cat.remainingBudget,
      expenseVsBudgetPercentage: cat.expenseVsBudgetPercentage,
      expenseStatus: cat.expenseStatus,
    })),

    // Comparison chart - total category budgets vs monthly budget
    comparisonChart: {
      monthlyBudget: totalMonthlyBudgetAmount,
      totalCategoryBudgets: totalBudgetMonthlyAmount,
      difference: totalMonthlyBudgetAmount - totalBudgetMonthlyAmount,
      isWithinLimit: totalBudgetMonthlyAmount <= totalMonthlyBudgetAmount,
      utilizationPercentage:
        totalMonthlyBudgetAmount > 0
          ? Math.round(
              (totalBudgetMonthlyAmount / totalMonthlyBudgetAmount) * 100 * 100
            ) / 100
          : 0,
    },

    // Expense comparison chart - expenses vs budgets
    expenseComparisonChart: {
      monthlyBudget: totalMonthlyBudgetAmount,
      totalCategoryBudgets: totalBudgetMonthlyAmount,
      totalExpenses: totalExpenseAmount,
      expenseVsMonthlyPercentage:
        totalMonthlyBudgetAmount > 0
          ? Math.round(
              (totalExpenseAmount / totalMonthlyBudgetAmount) * 100 * 100
            ) / 100
          : 0,
      expenseVsBudgetPercentage:
        totalBudgetMonthlyAmount > 0
          ? Math.round(
              (totalExpenseAmount / totalBudgetMonthlyAmount) * 100 * 100
            ) / 100
          : 0,
      remainingFromMonthly: totalMonthlyBudgetAmount - totalExpenseAmount,
      remainingFromBudgets: totalBudgetMonthlyAmount - totalExpenseAmount,
      isExpenseWithinMonthly: totalExpenseAmount <= totalMonthlyBudgetAmount,
      isExpenseWithinBudgets: totalExpenseAmount <= totalBudgetMonthlyAmount,
    },
  };

  // Calculate summary values
  const difference = totalMonthlyBudgetAmount - totalBudgetMonthlyAmount;
  const isWithinLimit = totalBudgetMonthlyAmount <= totalMonthlyBudgetAmount;
  const utilizationPercentage =
    totalMonthlyBudgetAmount > 0
      ? Math.round(
          (totalBudgetMonthlyAmount / totalMonthlyBudgetAmount) * 100 * 100
        ) / 100
      : 0;

  // Calculate expense summary values
  const expenseVsMonthlyPercentage =
    totalMonthlyBudgetAmount > 0
      ? Math.round(
          (totalExpenseAmount / totalMonthlyBudgetAmount) * 100 * 100
        ) / 100
      : 0;
  const expenseVsBudgetPercentage =
    totalBudgetMonthlyAmount > 0
      ? Math.round(
          (totalExpenseAmount / totalBudgetMonthlyAmount) * 100 * 100
        ) / 100
      : 0;
  const remainingFromMonthly = totalMonthlyBudgetAmount - totalExpenseAmount;
  const remainingFromBudgets = totalBudgetMonthlyAmount - totalExpenseAmount;

  // Create refined summary - remove duplicates and unnecessary data
  const budgetSummary = {
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    monthlyBudget: totalMonthlyBudgetAmount,
    categoryBudgets: categoryBudgets,
    summary: {
      totalCategoryBudgets: totalBudgetMonthlyAmount,
      totalExpenses: totalExpenseAmount,
      difference: difference,
      isWithinLimit: isWithinLimit,
      utilizationPercentage: utilizationPercentage,
      expenseVsMonthlyPercentage: expenseVsMonthlyPercentage,
      expenseVsBudgetPercentage: expenseVsBudgetPercentage,
      remainingFromMonthly: Math.round(remainingFromMonthly * 100) / 100,
      remainingFromBudgets: Math.round(remainingFromBudgets * 100) / 100,
      isExpenseWithinMonthly: totalExpenseAmount <= totalMonthlyBudgetAmount,
      isExpenseWithinBudgets: totalExpenseAmount <= totalBudgetMonthlyAmount,
    },
    chartData: chartData,
  };

  return ApiResponse.success(
    res,
    "Monthly budget summary fetched successfully",
    budgetSummary
  );
});
