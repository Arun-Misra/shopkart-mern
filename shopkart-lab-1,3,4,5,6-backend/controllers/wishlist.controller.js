const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const getCustomer = (req) => Customer.findById(req.user);

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validId(productId))
      return res.status(400).json({ success: false, message: "Invalid product ID" });

    if (!(await Product.findById(productId)))
      return res.status(404).json({ success: false, message: "Product not found" });

    const customer = await getCustomer(req);
    if (!customer)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (customer.wishlist.some(id => id.equals(productId)))
      return res.status(409).json({ success: false, message: "Product already in wishlist" });

    customer.wishlist.push(productId);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user)
      .select("wishlist")
      .populate("wishlist", "name price category image stock");

    if (!customer)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist.filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validId(productId))
      return res.status(400).json({ success: false, message: "Invalid product ID" });

    const customer = await getCustomer(req);
    if (!customer)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const index = customer.wishlist.findIndex(id => id.equals(productId));

    if (index === -1)
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist"
      });

    customer.wishlist.splice(index, 1);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validId(productId))
      return res.status(400).json({ success: false, message: "Invalid product ID" });

    if (!(await Product.findById(productId)))
      return res.status(404).json({ success: false, message: "Product not found" });

    const customer = await getCustomer(req);
    if (!customer)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const index = customer.wishlist.findIndex(id => id.equals(productId));

    if (index === -1) {
      customer.wishlist.push(productId);
      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        saved: true,
        count: customer.wishlist.length
      });
    }

    customer.wishlist.splice(index, 1);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      saved: false,
      count: customer.wishlist.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist
};