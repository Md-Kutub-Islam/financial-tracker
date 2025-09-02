import { Router } from "express";
import {
  createAccount,
  getAccounts,
  getOneAccount,
  updateAccount,
  deleteAccount,
} from "../controller/accountController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/create-account").post(authMiddleware, createAccount);
router.route("/get-accounts").get(authMiddleware, getAccounts);
router.route("/get-account/:accountId").get(authMiddleware, getOneAccount);
router.route("/update-account/:accountId").put(authMiddleware, updateAccount);
router
  .route("/delete-account/:accountId")
  .delete(authMiddleware, deleteAccount);

export default router;
