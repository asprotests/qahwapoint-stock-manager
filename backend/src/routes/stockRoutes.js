import express from "express";
import {
  getStockItems,
  getStockItem,
  createStockItem,
  updateStockItem,
  deleteStockItem,
} from "../controllers/stockController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getStockItems).post(createStockItem);
router
  .route("/:id")
  .get(getStockItem)
  .put(updateStockItem)
  .delete(deleteStockItem);

export default router;
