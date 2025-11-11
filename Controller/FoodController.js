import Food from "../Models/Foodlist.js";
import { io } from "../index.js";

// Create a Foods
export const createFood = async (req , res) =>{
    try {
        const food = await Food.create(req.body);
        io.emit("foodAdded", food); 
        res.status(200).json(food);
    } catch (error) {
        res.status(500).json({error: error.Message});
    }
};

// Get All Foods

export const getAllFoods = async (req , res) =>{
    try {
        const foodDetials = await Food.find();
        res.status(200).json({data: foodDetials});
    } catch (error) {
        console.log(error);
    }
};

// Update Foods

export const updateFoods = async (req, res) => { 
  try {
    const foodId = req.params.id;
    const { name, description, price, stock, image , category } = req.body;
    const updateFoods = await Food.findByIdAndUpdate(foodId,{ name, description, price, stock, image ,category },{ new: true });
    if (!updateFoods) {
        return res.status(404).json({ message: "food not found" });
    }
     io.emit("foodUpdated", updateFoods);
    res.status(200).json({ message: "food updated successfully",data: updateFoods });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete foods

export const deleteFoods = async (req , res) => {
    try {
        const foodId = req.params.id;
        const deleteFoods = await Food.findByIdAndDelete(foodId);
        if(!deleteFoods){
            return res.status(404).json({message:"food not found"});
        }
        io.emit("foodDeleted", foodId);
        res.status(200).json({message:"food is successfully deleted"})
    } catch (error) {
        res.status(500).json ({message:"foods not delete"})
    }
};


// Food details

export const foodDetails = async (req , res) => {
    try {
    const foodId = req.params.id;

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({data:food });
  } catch (error) {
    console.error("Error fetching food details:", error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Food Category

export const foodCategory = async (req, res) => {
    try {
        const category = req.params.category;

        if (!category) {
            return res.status(400).json({ error: "Category is required." });
        }

        // Case-insensitive search
        const foods = await Food.find({ category: { $regex: new RegExp(`^${category}$`, 'i') } });

        if (foods.length === 0) {
            return res.status(404).json({ message: "No food items found in this category." });
        }

        res.status(200).json({ data: foods });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// FoodComments

export const foodComments = async (req , res)=>{
     const foodId = req.params.id;
    const { user, text } = req.body;

    if (!user || !text) {
        return res.status(400).json({ error: 'User and comment text are required' });
    }

    try {
        const food = await Food.findById(foodId);
        if (!food) return res.status(404).json({ error: 'Food not found' });

        food.comments.push({ user, text });
        await food.save();

        res.status(200).json({ message: 'Comment added', food });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};


// Food Rating 

export const foodRating = async (req , res) => {
    const foodId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    try {
        const food = await Food.findById(foodId);
        if (!food) return res.status(404).json({ error: 'Food not found' });

        // For simplicity, we can average the existing rating with the new one
        food.rating = food.rating === 0 ? rating : (food.rating + rating) / 2;

        await food.save();
        res.status(200).json({ message: 'Rating updated', rating: food.rating });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
