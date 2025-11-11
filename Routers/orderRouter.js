import express from "express";
import { userMiddleware } from "../Middlewares/userMiddlewares.js";
import { getAllOrders, placeOrder, getMyOrders,updateOrderStatus, cancelMyOrder,
     rateDeliveredOrder } 
    from "../Controller/oderController.js";
import { roleMiddleware } from "../Middlewares/roleMiddlewares.js";
import { isDeliveryBoy } from "../Middlewares/deliveryboyMiddlewares.js";

const router = express.Router();

// Place Order for user
router.post("/createorder",userMiddleware,placeOrder);
router.get("/getmyorderuser",userMiddleware,getMyOrders);
router.put("/cancelorderuser/:id",userMiddleware,cancelMyOrder);
router.put("/rating/:id",userMiddleware,rateDeliveredOrder);


// Get All Orders (admin)
router.get("/getorder",getAllOrders,userMiddleware,roleMiddleware);
router.put("/status/:id",updateOrderStatus,userMiddleware,roleMiddleware,isDeliveryBoy);


export default router;
