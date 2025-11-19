import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  discardOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrder).delete(deleteOrder);
router.put("/:id/discard", discardOrder);

export default router;
