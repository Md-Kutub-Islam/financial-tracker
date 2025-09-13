import { Router } from "express";
import {
  createBudget,
  getBudgets,
  getOneBudget,
  updateBudget,
  deleteBudget,
} from "../controller/budgetController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/create-budget").post(authMiddleware, createBudget);
router.route("/get-budgets").get(authMiddleware, getBudgets);
router.route("/get-one-budget/:budgetId").get(authMiddleware, getOneBudget);
router.route("/update-budget/:budgetId").put(authMiddleware, updateBudget);
router.route("/delete-budget/:budgetId").delete(authMiddleware, deleteBudget);

export default router;
