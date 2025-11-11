import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user:{ type: mongoose.Schema.Types.ObjectId , ref:"User",required: true},
    items:[{
        food:{ type: mongoose.Schema.Types.ObjectId , ref:"Food" , required :true},
        quantity:{type: Number , required:true , default:1}
    }],
    totalPrice:{type: Number , required:true , default:0}
});

const Cart = mongoose.model("Cart",cartSchema);

export default Cart;