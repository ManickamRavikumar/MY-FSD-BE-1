import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  address: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    required: true
  },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Delivered", "Cancelled"], default: "Pending", },
  deliveredAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, enum: ["Admin", "Customer"], default: null },
  createdAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5, default: null },
  comment: { type: String, default: "" },
  mobile: { type: String },


  // 🔥 Location tracking fields
  customerLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  deliveryBoyLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  // 🔥 OTP for delivery confirmation
  otpCode: { type: String, default: null },

});
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
