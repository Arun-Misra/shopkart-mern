import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import loadRazorpayScript from "../services/razorpay";
import Navbar from "../components/Navbar";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

const INITIAL_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: ""
};

const validate = (address) => {
  const errors = {};
  const required = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode"
  ];

  required.forEach((field) => {
    if (!address[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (address.phone.trim() && !/^\d{10}$/.test(address.phone.trim())) {
    errors.phone = "Phone must be a 10 digit number";
  }

  if (
    address.pincode.trim() &&
    !/^\d{6}$/.test(address.pincode.trim())
  ) {
    errors.pincode = "Pincode must contain 6 digits";
  }

  return errors;
};

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, loading, unauthorized, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState(INITIAL_ADDRESS);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [serverReason, setServerReason] = useState("");
  const [placing, setPlacing] = useState(false);

  if (unauthorized) {
    return <Navigate to="/login" replace/>;
  }

  const handleChange = (field, value) => {
    setShippingAddress((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (placing) {
      return;
    }

    const validationErrors = validate(shippingAddress);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setServerReason("");
    setPlacing(true);

    try {
      const response = await api.post("/orders/create-payment-order", {
        shippingAddress
      });

      const data = response.data;

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setServerError(
          "Unable to load the payment window. Please try again."
        );
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: `Order ${data.shopKartOrderId}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone
        },
        handler: async (payment) => {
          try {
            await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature
            });

            clearCart();

            navigate(`/order-success/${data.shopKartOrderId}`);
          } catch (verifyError) {
            setPlacing(false);
            setServerError(
              verifyError.response?.data?.message ||
              "Payment verification failed. Your cart has not been cleared."
            );
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setServerError(
              "Payment cancelled. Your cart has not been cleared."
            );
          }
        }
      });

      razorpay.on("payment.failed", (response) => {
        setPlacing(false);
        setServerError(
          response?.error?.description ||
          "Payment failed. Your cart has not been cleared."
        );
      });

      razorpay.open();
    } catch (createError) {
      setPlacing(false);
      setServerError(
        createError.response?.data?.message ||
        "Unable to create order."
      );
      setServerReason(
        createError.response?.data?.reason ||
        ""
      );
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar/>
        <p className="checkout-state">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar/>

        <div className="checkout-state-block">
          <h2>Your cart is empty.</h2>
          <p>Add something before checking out.</p>

          <button
            className="checkout-primary"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar/>

      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
        </div>

        <div className="checkout-layout">
          <section className="checkout-details">
            <h2>Shipping Details</h2>

            {serverError && (
              <p className="checkout-error">{serverError}</p>
            )}

            {serverReason && (
              <p className="checkout-error-detail">
                {serverReason}
              </p>
            )}

            <CheckoutForm
              values={shippingAddress}
              errors={errors}
              onChange={handleChange}
              onSubmit={handleSubmit}
              placing={placing}
            />
          </section>

          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
          />
        </div>
      </div>
    </div>
  );
}

export default Checkout;