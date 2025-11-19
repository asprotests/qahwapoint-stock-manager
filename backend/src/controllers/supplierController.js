import Supplier from "../models/Supplier.js";

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private
export const createSupplier = async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name || !address || !phone) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const supplier = await Supplier.create({
      name,
      address,
      phone,
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
export const updateSupplier = async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.name = name || supplier.name;
    supplier.address = address || supplier.address;
    supplier.phone = phone || supplier.phone;

    const updatedSupplier = await supplier.save();

    res.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await supplier.deleteOne();

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
