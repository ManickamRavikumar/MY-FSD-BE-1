import Cart from "../Models/Cart.js";
import Food from "../Models/Foodlist.js";
import { io } from "../index.js";

// Add to Cart
export const addToCart = async (req, res) => {
    try {
        const { foodId, quantity } = req.body;
        const food = await Food.findById(foodId);

        if (!food) {
            return res.status(404).json({ message: "food not found" });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        }

        const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({food: foodId, quantity: quantity });
        }

        cart.totalPrice += food.price * quantity;
        await cart.save();
        res.status(200).json({ message: "Added to cart successfully",cart });

    } catch (error) {
      console.log(error);
        res.status(500).json({ error: error.message });
    }
 }


export const viewCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.food");

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", data: { items: [] } });
    }

    //  Remove items with missing food references
    cart.items = cart.items.filter(item => item.food !== null);

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.food.price * item.quantity, 0);

    await cart.save();

    res.status(200).json({ message: "Cart retrieved", data: cart });
  } catch (error) {
    console.error("Error in viewCart:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);
    if (itemIndex > -1) {
      const removedItem = cart.items.splice(itemIndex, 1)[0];
      cart.totalPrice -= removedItem.quantity * (await Food.findById(foodId)).price;
      await cart.save();
      res.status(200).json({ message: "Removed from cart", cart });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 
 
// Update Quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { change } = req.body; // +1 or -1

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += change;
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
      cart.totalPrice += change * (await Food.findById(foodId)).price;
      await cart.save();
      res.status(200).json({ message: "Cart updated", cart });
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

