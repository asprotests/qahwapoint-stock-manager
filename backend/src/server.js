import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// TEMPORARY: Secure seed endpoint - Admin user with ENV password
app.get("/api/seed-database", async (req, res) => {
  try {
    // Import User model
    const User = (await import("./models/User.js")).default;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "admin" });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin user already exists",
      });
    }

    // Get password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({
        success: false,
        message: "ADMIN_PASSWORD environment variable not set",
      });
    }

    // Create admin user
    const admin = await User.create({
      username: "admin",
      password: adminPassword, // This will be hashed by the User model pre-save hook
      role: "admin",
    });

    console.log("✅ Admin user created");

    res.json({
      success: true,
      message: "Admin user created successfully! 🎉",
      admin: {
        username: "admin",
        note: "Password set from ADMIN_PASSWORD environment variable",
      },
    });
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin user",
      error: error.message,
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "QahwaPoint API is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
