import express from "express";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getSuppliers).post(createSupplier);
router
  .route("/:id")
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router;
