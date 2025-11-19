import Product from "../models/Product.js";
import Stock from "../models/Stock.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: "ingredients.stockItem",
        select: "name unit cost costPer",
      })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "ingredients.stockItem",
      select: "name unit quantityAvailable cost costPer",
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { name, ingredients } = req.body;

    if (!name || !ingredients || ingredients.length === 0) {
      return res.status(400).json({
        message: "Please provide product name and at least one ingredient",
      });
    }

    // Validate all stock items exist
    for (const ingredient of ingredients) {
      const stockItem = await Stock.findById(ingredient.stockItem);
      if (!stockItem) {
        return res
          .status(404)
          .json({ message: `Stock item ${ingredient.stockItem} not found` });
      }
    }

    const product = await Product.create({
      name,
      ingredients,
    });

    const populatedProduct = await Product.findById(product._id).populate({
      path: "ingredients.stockItem",
      select: "name unit cost costPer",
    });

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { name, ingredients } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (ingredients && ingredients.length > 0) {
      // Validate all stock items exist
      for (const ingredient of ingredients) {
        const stockItem = await Stock.findById(ingredient.stockItem);
        if (!stockItem) {
          return res
            .status(404)
            .json({ message: `Stock item ${ingredient.stockItem} not found` });
        }
      }
      product.ingredients = ingredients;
    }

    if (name) {
      product.name = name;
    }

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(
      updatedProduct._id
    ).populate({
      path: "ingredients.stockItem",
      select: "name unit cost costPer",
    });

    res.json(populatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
