const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateShippingAddress = (shippingAddress) => {
  const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode"
  ];

  for(const field of requiredFields){
    const value = shippingAddress?.[field];

    if(typeof value !== "string" || value.trim().length === 0){
      return `${field} is required`;
    }
  }

  if(!/^\d{10}$/.test(shippingAddress.phone.trim())){
    return "Phone must be a 10 digit number";
  }

  if(!/^\d{6}$/.test(shippingAddress.pincode.trim())){
    return "Pincode must contain 6 digits";
  }

  return null;
};

const createPaymentOrder = async(req, res) => {
  try {
    const { shippingAddress } = req.body;

    const shippingError = validateShippingAddress(shippingAddress);

    if(shippingError){
      return res.status(400).json({
        success: false,
        message: shippingError
      });
    }

    const customer = await Customer.findById(req.user);

    if(!customer){
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if(!customer.cart || customer.cart.length === 0){
      return res.status(400).json({
        success: false,
        message: "Cart is empty."
      });
    }

    const productIds = customer.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(
      products.map((product) => [String(product._id), product])
    );

    const items = [];
    let totalAmount = 0;

    for(const cartItem of customer.cart){
      const product = productMap.get(String(cartItem.product));

      if(!product){
        return res.status(404).json({
          success: false,
          message: "One or more products in your cart no longer exist."
        });
      }

      if(cartItem.quantity > product.stock){
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const order = await Order.create({
      user: customer._id,
      items,
      shippingAddress,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    let razorpayOrder;

    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString()
      });
    } catch (razorpayError) {
      const status = razorpayError?.statusCode;
      const reason =
        razorpayError?.error?.description || razorpayError?.message;

      if(status === 401){
        console.error("[razorpay] Authentication failed - check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");

        return res.status(502).json({
          success: false,
          message: "Payment gateway rejected the request: authentication failed. Please contact support.",
          reason: "RAZORPAY_AUTH_FAILED"
        });
      }

      console.error("[razorpay] order creation failed", status, reason);

      return res.status(502).json({
        success: false,
        message: "Unable to start payment. Please try again.",
        reason: status ? `RAZORPAY_${status}` : "RAZORPAY_UNKNOWN",
        details: reason
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const verifyPayment = async(req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if(!shopKartOrderId || !isValidObjectId(shopKartOrderId)){
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const order = await Order.findById(shopKartOrderId);

    if(!order){
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if(!order.user.equals(req.user)){
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    if(!order.razorpayOrderId){
      return res.status(400).json({
        success: false,
        message: "Order has no payment session"
      });
    }

    const signatureBody =
      order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest("hex");

    const provided = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(expectedSignature);

    const isValid =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if(!isValid){
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    if(razorpay_order_id !== order.razorpayOrderId){
      return res.status(400).json({
        success: false,
        message: "Payment does not match this order"
      });
    }

    // Verification retries must not decrement inventory a second time.
    if(order.paymentStatus === "PAID"){
      if(order.razorpayPaymentId !== razorpay_payment_id){
        return res.status(409).json({
          success: false,
          message: "Order has already been paid with a different payment"
        });
      }

      const customer = await Customer.findById(req.user);
      if(customer && customer.cart.length > 0){
        customer.cart = [];
        await customer.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    const decremented = [];
    let orderMarkedPaid = false;
    const restoreStock = async() => {
      while(decremented.length > 0){
        const item = decremented[decremented.length - 1];

        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } }
        );

        decremented.pop();
      }
    };

    try {
      // Conditional atomic updates prevent stock from going below zero.
      for(const item of order.items){
        const result = await Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity }
          }
        );

        if(result.modifiedCount !== 1){
          const error = new Error("Stock is no longer available for one or more products.");
          error.code = "STOCK_UNAVAILABLE";
          throw error;
        }

        decremented.push(item);
      }

      // Claim the pending order only after stock is decremented. If another
      // verification wins the race, restore this request's stock changes.
      const paidOrder = await Order.findOneAndUpdate(
        {
          _id: shopKartOrderId,
          user: req.user,
          paymentStatus: "PENDING",
          razorpayOrderId: order.razorpayOrderId
        },
        {
          $set: {
            paymentStatus: "PAID",
            status: "PLACED",
            razorpayPaymentId: razorpay_payment_id
          }
        },
        { new: true }
      );

      if(!paidOrder){
        await restoreStock();
        decremented.length = 0;

        const latestOrder = await Order.findById(shopKartOrderId);

        if(
          latestOrder?.paymentStatus === "PAID" &&
          latestOrder.razorpayPaymentId === razorpay_payment_id
        ){
          return res.status(200).json({
            success: true,
            message: "Payment already verified",
            order: latestOrder
          });
        }

        return res.status(409).json({
          success: false,
          message: "This order is no longer awaiting payment verification."
        });
      }

      orderMarkedPaid = true;

      // Remove only the quantities purchased by this order. If the customer
      // added more items in another tab, those newer quantities are preserved.
      const customer = await Customer.findById(req.user);

      if(!customer){
        throw new Error("Customer not found after payment verification");
      }

      for(const purchasedItem of order.items){
        const cartItem = customer.cart.find(
          (item) => item.product.equals(purchasedItem.product)
        );

        if(!cartItem){
          continue;
        }

        cartItem.quantity -= purchasedItem.quantity;

        if(cartItem.quantity <= 0){
          customer.cart = customer.cart.filter(
            (item) => !item.product.equals(purchasedItem.product)
          );
        }
      }

      await customer.save();

      res.status(200).json({
        success: true,
        message: "Payment verified",
        order: paidOrder
      });
    } catch(paymentError) {
      if(decremented.length > 0 && !orderMarkedPaid){
        try {
          await restoreStock();
        } catch(restoreError) {
          console.error("[orders] failed to restore stock", restoreError?.message);
        }
      }

      if(paymentError.code === "STOCK_UNAVAILABLE"){
        // If a parallel verification already succeeded, this request must not
        // refund the successful payment.
        const latestOrder = await Order.findById(shopKartOrderId);

        if(
          latestOrder?.paymentStatus === "PAID" &&
          latestOrder.razorpayPaymentId === razorpay_payment_id
        ){
          return res.status(200).json({
            success: true,
            message: "Payment already verified",
            order: latestOrder
          });
        }

        // Only one concurrent request can claim the refund for this order.
        const failedOrder = await Order.findOneAndUpdate(
          {
            _id: shopKartOrderId,
            paymentStatus: "PENDING"
          },
          { $set: { paymentStatus: "FAILED" } },
          { new: true }
        );

        if(failedOrder){
          try {
            await razorpay.payments.refund(razorpay_payment_id);
          } catch(refundError) {
            console.error("[razorpay] refund failed after stock conflict", refundError?.message);

            return res.status(502).json({
              success: false,
              message: "Stock changed after payment. Please contact support to complete the refund; your cart has been kept."
            });
          }
        }

        return res.status(409).json({
          success: false,
          message: "Stock changed before payment completed. The payment is being refunded; your cart has been kept."
        });
      }

      // If the order was marked paid but clearing the cart failed, keep the
      // paid state; a verification retry will not charge or decrement stock again.
      throw paymentError;
    }

  } catch(error){
    console.error("[orders] payment verification failed", error?.message);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getOrders = async(req, res) => {
  try {
    const orders = await Order.find({ user: req.user })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getOrderById = async(req, res) => {
  try {
    const { id } = req.params;

    if(!isValidObjectId(id)){
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id);

    if(!order || !order.user.equals(req.user)){
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const PROGRESSION = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const nextStatus = (current) => {
  const index = PROGRESSION.indexOf(current);

  if(index === -1 || index === PROGRESSION.length - 1){
    return null;
  }

  return PROGRESSION[index + 1];
};

const updateOrderStatus = async(req, res) => {
  if(process.env.NODE_ENV === "production"){
    return res.status(404).json({
      success: false,
      message: "Not found"
    });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    if(!isValidObjectId(id)){
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    if(!PROGRESSION.includes(status)){
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${PROGRESSION.join(", ")}`
      });
    }

    const order = await Order.findById(id);

    if(!order || !order.user.equals(req.user)){
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if(order.paymentStatus !== "PAID"){
      return res.status(400).json({
        success: false,
        message: "Only a paid order can change status"
      });
    }

    const currentIndex = PROGRESSION.indexOf(order.status);
    const targetIndex = PROGRESSION.indexOf(status);

    if(targetIndex < currentIndex){
      return res.status(400).json({
        success: false,
        message: "Order status cannot move backwards"
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const advanceOrderStatus = async(req, res) => {
  if(process.env.NODE_ENV === "production"){
    return res.status(404).json({
      success: false,
      message: "Not found"
    });
  }

  try {
    const { id } = req.params;

    if(!isValidObjectId(id)){
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id);

    if(!order || !order.user.equals(req.user)){
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if(order.paymentStatus !== "PAID"){
      return res.status(400).json({
        success: false,
        message: "Only a paid order can change status"
      });
    }

    const upcoming = nextStatus(order.status);

    if(!upcoming){
      return res.status(400).json({
        success: false,
        message: "Order is already at its final status"
      });
    }

    order.status = upcoming;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order
    });

  } catch(error){
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
  advanceOrderStatus
};