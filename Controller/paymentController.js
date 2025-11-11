import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.SPRIPE_SECRET_KEY);


export const createCheckout = async (req, res) => {
    try {
        const { foodItems } = req.body;

        console.log("Received items:", foodItems);


        const line_items = foodItems.map((item) => {
            if (!item.food || !item.food.price) {
                throw new Error("Invalid food data - Missing food or price");
            }

            return {
                price_data: {
                    currency: "usd",
                    product_data: { name: item.food.name },
                    unit_amount: Math.round(item.food.price * 100),
                },
                quantity: item.quantity,
            }
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://localhost:5173/ordersuccess?paid=true",
            cancel_url: "http://localhost:5173/order",
        })

        res.json({ url: session.url });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });

    }
};