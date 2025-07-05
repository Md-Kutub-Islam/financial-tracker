import { Router } from "express";
import { createCategory, getCategories, getOneCategory, updateCategory, deleteCategory } from "../controller/categoriesController.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/create-category").post(authMiddleware, createCategory);
router.route("/get-categories").get(authMiddleware, getCategories);
router.route("/get-category/:id").get(authMiddleware, getOneCategory);
router.route("/update-category/:id").put(authMiddleware, updateCategory);
router.route("/delete-category/:id").delete(authMiddleware, deleteCategory);

export default router;