import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user:{type: String, required: true},
    text:{type: String, required: true}
},{timestamps: true});

const foodSchema = new mongoose.Schema({
    name: String,
    image:String,
    price:String,
    stock:Number,
    description:String,
    category:String,
    rating: {type: Number,default: 0},
    comments: [commentSchema]
});

const Food = mongoose.model.Food || mongoose.model("Food",foodSchema);
export default Food;