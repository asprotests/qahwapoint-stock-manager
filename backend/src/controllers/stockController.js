import Stock from "../models/Stock.js";

// @desc    Get all stock items with optional sorting
// @route   GET /api/stock
// @access  Private
export const getStockItems = async (req, res) => {
  try {
    const { sortBy } = req.query;
    let sortOption = { createdAt: -1 };

    if (sortBy === "category") {
      sortOption = { category: 1, name: 1 };
    } else if (sortBy === "supplier") {
      sortOption = { supplier: 1, name: 1 };
    }

    const stockItems = await Stock.find().populate("supplier").sort(sortOption);
    res.json(stockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single stock item
// @route   GET /api/stock/:id
// @access  Private
export const getStockItem = async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id).populate("supplier");

    if (!stockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.json(stockItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create stock item
// @route   POST /api/stock
// @access  Private
export const createStockItem = async (req, res) => {
  try {
    const { name, category, unit, quantityAvailable, cost, costPer, supplier } =
      req.body;

    if (
      !name ||
      !category ||
      !unit ||
      quantityAvailable === undefined ||
      cost === undefined ||
      costPer === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const stockItem = await Stock.create({
      name,
      category,
      unit,
      quantityAvailable,
      cost,
      costPer,
      supplier: supplier || null,
    });

    const populatedStockItem = await Stock.findById(stockItem._id).populate(
      "supplier"
    );

    res.status(201).json(populatedStockItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update stock item
// @route   PUT /api/stock/:id
// @access  Private
export const updateStockItem = async (req, res) => {
  try {
    const { name, category, unit, quantityAvailable, cost, costPer, supplier } =
      req.body;

    const stockItem = await Stock.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    stockItem.name = name || stockItem.name;
    stockItem.category = category || stockItem.category;
    stockItem.unit = unit || stockItem.unit;
    stockItem.quantityAvailable =
      quantityAvailable !== undefined
        ? quantityAvailable
        : stockItem.quantityAvailable;
    stockItem.cost = cost !== undefined ? cost : stockItem.cost;
    stockItem.costPer = costPer !== undefined ? costPer : stockItem.costPer;
    stockItem.supplier =
      supplier !== undefined ? supplier || null : stockItem.supplier;

    const updatedStockItem = await stockItem.save();
    const populatedStockItem = await Stock.findById(
      updatedStockItem._id
    ).populate("supplier");

    res.json(populatedStockItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete stock item
// @route   DELETE /api/stock/:id
// @access  Private
export const deleteStockItem = async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id);

    if (!stockItem) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    await stockItem.deleteOne();

    res.json({ message: "Stock item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
