import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import connectDB from "../config/database.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Supplier.deleteMany();
    await Stock.deleteMany();
    await Product.deleteMany();

    console.log("🗑️  Cleared existing data");

    // Create admin user
    const admin = await User.create({
      username: "admin",
      password: "admin123",
      role: "admin",
    });

    console.log("✅ Admin user created (username: admin, password: admin123)");

    // Create suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: "Fresh Foods Ltd",
        address: "123 Market Street",
        phone: "+1234567890",
      },
      {
        name: "Dairy Delights",
        address: "456 Farm Road",
        phone: "+0987654321",
      },
      {
        name: "Spice Kingdom",
        address: "789 Aroma Avenue",
        phone: "+1122334455",
      },
    ]);

    console.log("✅ Suppliers created");

    // Create stock items
    const stockItems = await Stock.insertMany([
      {
        name: "Coffee Beans",
        category: "Beverages",
        unit: "kg",
        quantityAvailable: 50,
        cost: 25,
        costPer: 1, // $25 per 1 kg
        supplier: suppliers[0]._id,
      },
      {
        name: "Milk",
        category: "Dairy",
        unit: "liters",
        quantityAvailable: 100,
        cost: 3,
        costPer: 1, // $3 per 1 liter
        supplier: suppliers[1]._id,
      },
      {
        name: "Sugar",
        category: "Sweeteners",
        unit: "kg",
        quantityAvailable: 30,
        cost: 2,
        costPer: 1, // $2 per 1 kg
        supplier: suppliers[0]._id,
      },
      {
        name: "Cinnamon",
        category: "Spices",
        unit: "grams",
        quantityAvailable: 500,
        cost: 15,
        costPer: 100, // $15 per 100 grams
        supplier: suppliers[2]._id,
      },
      {
        name: "Chocolate Syrup",
        category: "Syrups",
        unit: "ml",
        quantityAvailable: 2000,
        cost: 8,
        costPer: 500, // $8 per 500 ml
        supplier: suppliers[0]._id,
      },
      {
        name: "Whipped Cream",
        category: "Dairy",
        unit: "ml",
        quantityAvailable: 1500,
        cost: 5,
        costPer: 250, // $5 per 250 ml
        supplier: suppliers[1]._id,
      },
      {
        name: "Vanilla Extract",
        category: "Flavorings",
        unit: "ml",
        quantityAvailable: 300,
        cost: 12,
        costPer: 50, // $12 per 50 ml
        supplier: suppliers[2]._id,
      },
    ]);

    console.log("✅ Stock items created");

    // Create products
    const products = await Product.insertMany([
      {
        name: "Cappuccino",
        ingredients: [
          {
            stockItem: stockItems[0]._id,
            unit: "kg",
            quantityRequired: 0.02,
          },
          {
            stockItem: stockItems[1]._id,
            unit: "liters",
            quantityRequired: 0.15,
          },
        ],
      },
      {
        name: "Mocha Latte",
        ingredients: [
          {
            stockItem: stockItems[0]._id,
            unit: "kg",
            quantityRequired: 0.025,
          },
          {
            stockItem: stockItems[1]._id,
            unit: "liters",
            quantityRequired: 0.2,
          },
          {
            stockItem: stockItems[4]._id,
            unit: "ml",
            quantityRequired: 30,
          },
          {
            stockItem: stockItems[5]._id,
            unit: "ml",
            quantityRequired: 50,
          },
        ],
      },
      {
        name: "Cinnamon Coffee",
        ingredients: [
          {
            stockItem: stockItems[0]._id,
            unit: "kg",
            quantityRequired: 0.02,
          },
          {
            stockItem: stockItems[1]._id,
            unit: "liters",
            quantityRequired: 0.1,
          },
          {
            stockItem: stockItems[3]._id,
            unit: "grams",
            quantityRequired: 5,
          },
          {
            stockItem: stockItems[2]._id,
            unit: "kg",
            quantityRequired: 0.01,
          },
        ],
      },
    ]);

    console.log("✅ Products created");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Admin user: admin / admin123`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Stock items: ${stockItems.length}`);
    console.log(`   - Products: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
