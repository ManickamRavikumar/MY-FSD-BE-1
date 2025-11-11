import express from "express";
import { userMiddleware } from "../Middlewares/userMiddlewares.js";
import { addToCart, removeFromCart, updateCartQuantity, viewCart } from "../Controller/cartController.js";

const router = express.Router();

router.post("/add",userMiddleware,addToCart);
router.get("/viewcart",userMiddleware,viewCart);
router.delete("/remove/:foodId",userMiddleware,removeFromCart);
router.put("/update/:foodId",userMiddleware,updateCartQuantity);

export default router;