import express from "express";
import { userMiddleware } from "../Middlewares/userMiddlewares.js";
import { roleMiddleware } from "../Middlewares/roleMiddlewares.js";
import { createFood , getAllFoods, updateFoods ,deleteFoods, foodComments, foodRating, foodDetails, foodCategory} from "../Controller/FoodController.js"

const router = express.Router();

router.post("/create",userMiddleware,roleMiddleware,createFood);
router.get("/",getAllFoods,userMiddleware,roleMiddleware);
router.put("/update/:id",updateFoods,roleMiddleware,userMiddleware);
router.delete("/delete/:id",userMiddleware,roleMiddleware,deleteFoods);
router.post("/:id/comment",userMiddleware,roleMiddleware,foodComments);
router.post("/:id/rating",userMiddleware,roleMiddleware,foodRating);
router.get("/:id",foodDetails,userMiddleware,roleMiddleware)
router.get("/menu/:category",foodCategory,userMiddleware,roleMiddleware);

export default router;
