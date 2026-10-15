const dotenv = require("dotenv");

// Load environment variables before modules that read them during import.
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

const healthCheck = (req, res) => {
  res.status(200).json({ success: true, message: "ShopKart API is running" });
};

app.get("/health", healthCheck);
app.get("/api/health", healthCheck);

// Keep the original paths for local development and support Vercel's /api rewrite.
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB is connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
