const dotenv = require("dotenv");

// dotenv must load before any module that reads process.env at require time,
// otherwise config/razorpay.js is constructed with undefined keys.
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
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB is connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running, the port is ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed");
  });