import { Router } from "express";
import {
  createBudget,
  getBudgets,
  getOneBudget,
  updateBudget,
  deleteBudget,
  monthlyBudetsSetup,
  getMonthlyBudgets,
  updateMonthlyBudget,
  deleteMonthlyBudget,
  getMonthlyBudgetSummary,
} from "../controller/budgetController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/create-budget").post(authMiddleware, createBudget);
router.route("/get-budgets").get(authMiddleware, getBudgets);
router.route("/get-one-budget/:budgetId").get(authMiddleware, getOneBudget);
router.route("/update-budget/:budgetId").put(authMiddleware, updateBudget);
router.route("/delete-budget/:budgetId").delete(authMiddleware, deleteBudget);

// Monthly budget routes
router.route("/get-monthly-budgets").get(authMiddleware, getMonthlyBudgets);
router
  .route("/get-monthly-budget-summary")
  .get(authMiddleware, getMonthlyBudgetSummary)
  .post(authMiddleware, getMonthlyBudgetSummary);
router.route("/create-monthly-budget").post(authMiddleware, monthlyBudetsSetup);
router
  .route("/update-monthly-budget/:monthlyBudgetId")
  .put(authMiddleware, updateMonthlyBudget);
router
  .route("/delete-monthly-budget/:monthlyBudgetId")
  .delete(authMiddleware, deleteMonthlyBudget);

export default router;
