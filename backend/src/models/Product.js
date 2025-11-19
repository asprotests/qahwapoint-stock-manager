import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    stockItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: [true, "Stock item is required"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
    },
    quantityRequired: {
      type: Number,
      required: [true, "Quantity required is required"],
      min: [0, "Quantity cannot be negative"],
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    ingredients: {
      type: [ingredientSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Product must have at least one ingredient",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
