import { Router } from "express";
import {
  createBudget,
  getBudgets,
  getOneBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  monthlyBudetsSetup,
} from "../controller/budgetController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/create-budget").post(authMiddleware, createBudget);
router.route("/get-budgets").get(authMiddleware, getBudgets);
router.route("/get-one-budget/:budgetId").get(authMiddleware, getOneBudget);
router.route("/update-budget/:budgetId").put(authMiddleware, updateBudget);
router.route("/delete-budget/:budgetId").delete(authMiddleware, deleteBudget);
router.route("/monthly-budget").post(authMiddleware, monthlyBudetsSetup);
router.route("/public-budgets").get(authMiddleware, getBudgetSummary); // Public route to fetch budgets

export default router;
