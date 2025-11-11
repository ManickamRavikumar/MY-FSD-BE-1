import express from 'express';
import dotenv from 'dotenv';
import connectDB from './Config/dbConfig.js';
import userRouter from './Routers/userRouter.js';
import foodRouter from './Routers/foodRouter.js';
import cartRouter from './Routers/cartRouter.js';
import orderRouter from "./Routers/orderRouter.js";
import paymentRouter from "./Routers/paymentRouter.js";
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();

app.use(cors({ origin: '*' })); // change '*' to your frontend URL in production

app.use(express.json());

connectDB();

app.use("/api/auth", userRouter);
app.use("/api/foods",foodRouter)
app.use("/api/cart",cartRouter);
app.use("/api/order",orderRouter);
app.use("/api/payment",paymentRouter);


const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/", // change to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);


  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    for (const [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
  });
});

// Export io for controllers
export { io , onlineUsers };

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})