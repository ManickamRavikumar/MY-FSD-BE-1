import express from "express";
import { createCheckout } from "../Controller/paymentController.js";

const router = express.Router();

// Create Checkout Session
router.post("/create-checkout", createCheckout);

export default router;
