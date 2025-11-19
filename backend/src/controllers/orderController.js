import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stock from "../models/Stock.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "products.product",
        select: "name",
      })
      .sort({ dateCreated: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "products.product",
      populate: {
        path: "ingredients.stockItem",
        select: "name unit",
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create order (WITHOUT TRANSACTIONS - for standalone MongoDB)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one product" });
    }

    // Calculate total ingredients needed
    const ingredientsNeeded = {};

    for (const orderProduct of products) {
      const product = await Product.findById(orderProduct.product).populate(
        "ingredients.stockItem"
      );

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${orderProduct.product} not found` });
      }

      // Check if product has ingredients
      if (!product.ingredients || product.ingredients.length === 0) {
        return res.status(400).json({
          message: `Product "${product.name}" has no ingredients defined`,
        });
      }

      for (const ingredient of product.ingredients) {
        // Check if stock item exists
        if (!ingredient.stockItem) {
          return res.status(400).json({
            message: `Stock item for ingredient in "${product.name}" not found`,
          });
        }

        const stockId = ingredient.stockItem._id.toString();
        const totalNeeded = ingredient.quantityRequired * orderProduct.quantity;

        if (!ingredientsNeeded[stockId]) {
          ingredientsNeeded[stockId] = {
            name: ingredient.stockItem.name,
            currentStock: ingredient.stockItem.quantityAvailable,
            needed: 0,
          };
        }

        ingredientsNeeded[stockId].needed += totalNeeded;
      }
    }

    // Check if all ingredients are available
    for (const [stockId, data] of Object.entries(ingredientsNeeded)) {
      if (data.currentStock < data.needed) {
        return res.status(400).json({
          message: `Order cannot be placed. Ingredient "${data.name}" is not enough. Available: ${data.currentStock}, Needed: ${data.needed}`,
        });
      }
    }

    // Deduct stock quantities
    for (const [stockId, data] of Object.entries(ingredientsNeeded)) {
      await Stock.findByIdAndUpdate(stockId, {
        $inc: { quantityAvailable: -data.needed },
      });
    }

    // Create order
    const order = await Order.create({
      products,
      status: "completed",
      dateCreated: new Date(),
    });

    const populatedOrder = await Order.findById(order._id).populate({
      path: "products.product",
      select: "name",
    });

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Discard order (return stock) - WITHOUT TRANSACTIONS
// @route   PUT /api/orders/:id/discard
// @access  Private
export const discardOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "products.product",
      populate: {
        path: "ingredients.stockItem",
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "discarded") {
      return res.status(400).json({ message: "Order is already discarded" });
    }

    // Calculate ingredients to return
    const ingredientsToReturn = {};
    let hasValidProducts = false;

    for (const orderProduct of order.products) {
      // Skip if product was deleted
      if (!orderProduct.product) {
        console.log(`⚠️  Product reference in order is null, skipping...`);
        continue;
      }

      // Skip if product has no ingredients
      if (
        !orderProduct.product.ingredients ||
        orderProduct.product.ingredients.length === 0
      ) {
        console.log(
          `⚠️  Product "${orderProduct.product.name}" has no ingredients, skipping...`
        );
        continue;
      }

      hasValidProducts = true;

      for (const ingredient of orderProduct.product.ingredients) {
        // Skip if stock item was deleted
        if (!ingredient.stockItem || !ingredient.stockItem._id) {
          console.log(`⚠️  Stock item reference is null, skipping...`);
          continue;
        }

        const stockId = ingredient.stockItem._id.toString();
        const totalToReturn =
          ingredient.quantityRequired * orderProduct.quantity;

        if (!ingredientsToReturn[stockId]) {
          ingredientsToReturn[stockId] = 0;
        }

        ingredientsToReturn[stockId] += totalToReturn;
      }
    }

    if (!hasValidProducts) {
      console.log(`⚠️  No valid products found to return stock for`);
    }

    // Return stock quantities
    for (const [stockId, quantity] of Object.entries(ingredientsToReturn)) {
      const stock = await Stock.findById(stockId);
      if (stock) {
        stock.quantityAvailable += quantity;
        await stock.save();
        console.log(`✅ Returned ${quantity} ${stock.unit} of ${stock.name}`);
      } else {
        console.log(
          `⚠️  Stock item ${stockId} not found, cannot return quantity`
        );
      }
    }

    // Update order status
    order.status = "discarded";
    await order.save();

    // Re-populate before sending response
    const populatedOrder = await Order.findById(order._id).populate({
      path: "products.product",
      select: "name",
    });

    res.json(populatedOrder);
  } catch (error) {
    console.error("❌ Error in discardOrder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order is discarded before allowing deletion
    if (order.status !== "discarded") {
      return res.status(400).json({
        message:
          "Order must be discarded before deletion. Please discard the order first to return stock quantities.",
      });
    }

    await order.deleteOne();

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
