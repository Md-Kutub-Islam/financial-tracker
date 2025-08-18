import { Router } from "express";
import {
  createTransaction,
  getTransactions,
  getOneTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controller/transactionController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/create-transaction").post(authMiddleware, createTransaction);
router.route("/get-transactions").get(authMiddleware, getTransactions);
router
  .route("/get-transaction/:transactionId")
  .get(authMiddleware, getOneTransaction);
router
  .route("/update-transaction/:transactionId")
  .put(authMiddleware, updateTransaction);
router
  .route("/delete-transaction/:transactionId")
  .delete(authMiddleware, deleteTransaction);

export default router;
