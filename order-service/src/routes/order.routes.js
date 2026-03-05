import express from "express";
import { createOrderHandler } from "../controller/order.controllers.js";

const router = express.Router();

/**
 * POST /api/orders
 */
router.post("/orders", createOrderHandler);

export default router;