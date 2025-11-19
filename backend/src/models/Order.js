import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    products: {
      type: [orderProductSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Order must have at least one product",
      },
    },
    status: {
      type: String,
      enum: ["completed", "discarded"],
      default: "completed",
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
