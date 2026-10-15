const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

const getCustomer = (id) => Customer.findById(id);

const getCart = async (id) => {
  const customer = await Customer.findById(id)
    .select("cart")
    .populate({
      path: "cart.product",
      select: "name price image stock category"
    });

  return customer?.cart.filter(item => item.product) || [];
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validId(productId))
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    const customer = await getCustomer(req.user);

    if (!customer)
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    const item = customer.cart.find(
      item => item.product.equals(product._id)
    );

    if (item) {
      if (item.quantity + 1 > product.stock)
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) of "${product.name}" available`
        });

      item.quantity++;
    } else {
      if (product.stock < 1)
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is out of stock`
        });

      customer.cart.push({
        product: product._id,
        quantity: 1
      });
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: await getCart(customer._id)
    });

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const fetchCart = async (req, res) => {
  try {
    const customer = await getCustomer(req.user);

    if (!customer)
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    const cart = await getCart(customer._id);

    res.status(200).json({
      success: true,
      count: cart.length,
      cart
    });

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!validId(productId))
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });

    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });

    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    if (quantity > product.stock)
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of "${product.name}" available`
      });

    const customer = await getCustomer(req.user);

    if (!customer)
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    const item = customer.cart.find(
      item => item.product.equals(product._id)
    );

    if (!item)
      return res.status(404).json({
        success: false,
        message: "Product not in cart"
      });

    item.quantity = quantity;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: await getCart(customer._id)
    });

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validId(productId))
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });

    const customer = await getCustomer(req.user);

    if (!customer)
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

    const index = customer.cart.findIndex(
      item => item.product.equals(productId)
    );

    if (index === -1)
      return res.status(404).json({
        success: false,
        message: "Product not in cart"
      });

    customer.cart.splice(index, 1);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: await getCart(customer._id)
    });

  } catch {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  addToCart,
  getCart: fetchCart,
  updateCartQuantity,
  removeFromCart
};