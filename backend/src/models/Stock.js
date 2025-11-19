import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Stock name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
    },
    quantityAvailable: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
    costPer: {
      type: Number,
      required: [true, "Cost per unit is required"],
      min: [0.01, "Cost per must be at least 0.01"],
      default: 1,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to calculate cost per single unit
stockSchema.virtual("costPerUnit").get(function () {
  return this.cost / this.costPer;
});

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
