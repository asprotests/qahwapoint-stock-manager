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

// // TEMPORARY: Protected seed endpoint
// app.get("/api/seed-database", async (req, res) => {
//   try {
//     // Check if MongoDB is connected
//     const mongoose = (await import("mongoose")).default;
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(503).json({
//         success: false,
//         message: "Database not connected yet. Please wait and try again.",
//         connectionState: mongoose.connection.readyState,
//         states: {
//           0: "disconnected",
//           1: "connected",
//           2: "connecting",
//           3: "disconnecting",
//         },
//       });
//     }

//     // Import User model
//     const User = (await import("./models/User.js")).default;

//     // Check if admin already exists
//     const existingAdmin = await User.findOne({ username: "admin" });

//     if (existingAdmin) {
//       return res.json({
//         success: true,
//         message: "Admin user already exists",
//       });
//     }

//     // Get password from environment variable
//     const adminPassword = process.env.ADMIN_PASSWORD;

//     if (!adminPassword) {
//       return res.status(500).json({
//         success: false,
//         message: "ADMIN_PASSWORD environment variable not set",
//       });
//     }

//     // Create admin user
//     await User.create({
//       username: "admin",
//       password: adminPassword,
//       role: "admin",
//     });

//     console.log("✅ Admin user created");

//     res.json({
//       success: true,
//       message: "Admin user created successfully! 🎉",
//       admin: {
//         username: "admin",
//         note: "Password set from ADMIN_PASSWORD environment variable",
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating admin:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating admin user",
//       error: error.message,
//     });
//   }
// });

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "QahwaPoint API is running",
    dbStatus:
      require("mongoose").connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

// Connect to database and start server
const startServer = async () => {
  try {
    console.log("🚀 Starting QahwaPoint Backend...");

    // Wait for database connection
    await connectDB();

    // Start server only after DB connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server successfully started on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
