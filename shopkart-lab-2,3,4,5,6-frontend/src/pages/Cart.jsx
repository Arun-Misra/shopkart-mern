import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";
import "./Cart.css";

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        loading,
        error,
        unauthorized,
        subtotal,
        totalItems,
        refreshCart,
        updateQuantity,
        removeFromCart
    } = useCart();

    if(unauthorized){
        return <Navigate to="/login" replace/>;
    }

    return (
        <div className="cart-page">
            <Navbar/>

            <div className="cart-container">
                <div className="cart-header">
                    <h1>Your Cart</h1>

                    {!loading && !error && (
                        <p>
                            {totalItems}{" "}
                            {totalItems === 1
                                ? "item"
                                : "items"}
                        </p>
                    )}
                </div>

                {loading ? (
                    <p className="cart-state">
                        Loading your cart...
                    </p>
                ) : error ? (
                    <div className="cart-state">
                        <h2>Unable to load your cart.</h2>
                        <p>
                            Something went wrong while
                            fetching your cart.
                        </p>
                        <button
                            className="cart-primary"
                            onClick={refreshCart}
                        >
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="cart-state">
                        <p className="cart-emoji">
                            &#128722;
                        </p>
                        <h2>
                            Your cart is empty
                        </h2>
                        <p>
                            Looks like you haven't added
                            anything yet.
                        </p>
                        <button
                            className="cart-primary"
                            onClick={() => navigate("/products")}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.product._id}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </div>

                        <aside className="order-summary">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>
                                    Items: {totalItems}
                                </span>
                            </div>

                            <div className="summary-row summary-total">
                                <span>
                                    Subtotal
                                </span>
                                <span>
                                    ₹{subtotal}
                                </span>
                            </div>

                            <button
                                className="cart-primary"
                                onClick={() =>
                                    navigate("/checkout")
                                }
                            >
                                Proceed to Checkout
                            </button>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;