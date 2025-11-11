import Order from "../Models/Oders.js";
import Cart from "../Models/Cart.js";
import Food from "../Models/Foodlist.js";
import { sendEmail } from "../Utils/mailer.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import crypto from "crypto";

// Place Order for user

export const placeOrder = async (req, res) => {
  try {
    const { address, paymentMethod, mobile, customerLocation } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.food");
    console.log(cart);

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "your cart is empty" });
    };
    const totalPrice = cart.items.reduce((acc, item) => acc + item.food.price * item.quantity, 0);
    const otp = crypto.randomInt(100000, 999999).toString();

    const order = new Order({
      user: req.user._id,
      items: cart.items,
      address,
      paymentMethod,
      totalPrice,
      status: "Pending",
      customerLocation,
      otpCode: otp,
      mobile,
    });
    await order.save();

    if (cart) {
      await Cart.findOneAndDelete({ user: req.user._id });
    };
    // Create detailed bill HTML
    const billHTML = `
      <h2>🍽️ Food Order Confirmation</h2>
      <p>Thank you for your order, <strong>${req.user.name}</strong>!</p>
      <h3>Order Summary:</h3>
      <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f3f3f3;">
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${cart.items
        .map(
          (item) => `
              <tr>
                <td>${item.food.name}</td>
                <td>${item.quantity}</td>
                <td>$${(item.food.price * item.quantity).toFixed(2)}</td>
              </tr>`
        )
        .join("")}
        </tbody>
      </table>
      <h3>Total: $${totalPrice.toFixed(2)}</h3>
      <p><strong>Delivery Address:</strong> ${address}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p>Your OTP for delivery confirmation is: <strong>${otp}</strong></p>
      <p>We’ll notify you when your order is out for delivery. 🍕</p>
    `;
    // Optional: Generate PDF invoice
    const invoiceDir = "invoices";
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

    const pdfPath = path.join(invoiceDir, `invoice_${order._id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).text("Food Order Invoice", { align: "center" });
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${req.user.name}`);
    doc.text(`Address: ${address}`);
    doc.moveDown();

    cart.items.forEach((item) => {
      doc.text(`${item.food.name} x ${item.quantity} - $${item.food.price * item.quantity}`);
    });
    doc.moveDown();
    doc.text(`Total: $${totalPrice.toFixed(2)}`);
    doc.end();

    // Send confirmation email with bill and PDF invoice
    try {
      const userEmail = req.user.email;
      await sendEmail(userEmail, "your food order confirmation", `your order 0f $${totalPrice} is confirmed!`, billHTML, pdfPath);

    } catch (error) {
      console.log("email sending failed");
    }

    res.status(200).json({ message: "order placed successfully", order })
  } catch (error) {
    res.status(500).json({ message: "error" })
  }
};

// Get Orders By User
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.food").sort({ createdAt: -1 });

    res.status(200).json({ message: 'My Orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get All Orders (admin)

export const getAllOrders = async (req, res) => {
  try {
    const order = await Order.find().populate("user").populate("items.food").sort({ createdAt: -1 });
    res.status(200).json({ message: "Get All Orders", orderData: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

// Update Order Status (Admin Only)
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const updateData = { status };

    if (status === "Delivered") {
      updateData.deliveredAt = new Date();
      updateData.cancelledAt = null; // reset cancelledAt if previously set
      updateData.cancelledBy = null;
    } else if (status === "Cancelled") {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = "Admin";
      updateData.deliveredAt = null; // reset deliveredAt if previously set
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });

    if (!updatedOrder)
      return res.status(404).json({ message: "Order Not Found" });
    res.status(200).json({ message: "Order Status Updated", data: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Cancel Order by Customer

export const cancelMyOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order that belongs to the logged-in user
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Order cannot be cancelled. It’s already processed." });
    }

    order.status = "Cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = "Customer";
    await order.save();
    return res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ⭐ Rate Delivered Order


export const rateDeliveredOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    // Find the user’s delivered order
    const order = await Order.findOne({ _id: orderId, user: req.user._id }).populate("items.food");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Delivered") return res.status(400).json({ message: "You can only rate delivered orders." });
    if (order.rating) return res.status(400).json({ message: "You already rated this order." });

    // Save rating in order
    order.rating = rating;
    order.comment = comment;
    await order.save();

    // Update each food’s rating and comments
    for (const item of order.items) {
      const food = await Food.findById(item.food._id);
      if (food) {
        // Simple average formula
        food.rating = food.rating === 0 ? rating : (food.rating + rating) / 2;

        // Add comment
        if (comment && comment.trim()) {
          food.comments.push({ user: req.user.name || req.user.email, text: comment });
        }

        await food.save();
      }
    }

    res.status(200).json({ message: "Rating added successfully!", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

