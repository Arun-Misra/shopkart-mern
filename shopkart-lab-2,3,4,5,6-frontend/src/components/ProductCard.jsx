import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product, isWishlisted, onChange }) {
    const navigate = useNavigate();
    const {
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart
    } = useCart();

    const [wishlistStatus, setWishlistStatus] = useState("idle");
    const [cartPending, setCartPending] = useState(false);
    const [cartError, setCartError] = useState("");
    const [notice, setNotice] = useState("");

    const noticeTimer = useRef(null);

    useEffect(() => {
        return () => clearTimeout(noticeTimer.current);
    }, []);

    const flash = (message) => {
        setNotice(message);
        clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setNotice(""), 2500);
    };

    const inCartQuantity = cartItems.find(
        (item) => item.product._id === product._id
    )?.quantity ?? 0;

    const inCart = inCartQuantity > 0;
    const outOfStock = product.stock < 1;
    const atStockLimit = inCartQuantity >= product.stock;

    const cartErrorMessage = (requestError) =>
        requestError.response?.data?.message ||
        "Unable to update your cart.";

    const handleToggleWishlist = async() => {
        if(wishlistStatus === "saving"){
            return;
        }

        setWishlistStatus("saving");

        try {
            const response = await api.patch(
                `/wishlist/${product._id}/toggle`
            );

            onChange(product._id, response.data.saved);

            setWishlistStatus("idle");

            flash(
                response.data.saved
                    ? "♥ Added to Wishlist"
                    : "Removed from wishlist"
            );
        } catch {
            setWishlistStatus("error");
        }
    };

    const handleAddToCart = async() => {
        if(cartPending || outOfStock){
            return;
        }

        setCartPending(true);
        setCartError("");

        try {
            await addToCart(product._id);
        } catch (requestError) {
            setCartError(cartErrorMessage(requestError));
        } finally {
            setCartPending(false);
        }
    };

    const handleIncrement = async() => {
        if(cartPending || atStockLimit){
            return;
        }

        setCartPending(true);
        setCartError("");

        try {
            await updateQuantity(product._id, inCartQuantity + 1);
        } catch (requestError) {
            setCartError(cartErrorMessage(requestError));
        } finally {
            setCartPending(false);
        }
    };

    const handleDecrement = async() => {
        if(cartPending){
            return;
        }

        setCartPending(true);
        setCartError("");

        try {
            if(inCartQuantity <= 1){
                await removeFromCart(product._id);
            } else {
                await updateQuantity(product._id, inCartQuantity - 1);
            }
        } catch (requestError) {
            setCartError(cartErrorMessage(requestError));
        } finally {
            setCartPending(false);
        }
    };

    return (
        <div className="product-item">
            <img
                className="product-image"
                src={product.image}
                alt={product.name}
            />

            <p className="product-category">
                {product.category}
            </p>

            <h2>{product.name}</h2>

            <p className="product-price">
                ₹{product.price}
            </p>

            <p className="product-stock">
                {product.stock > 0
                    ? "In Stock"
                    : "Out of Stock"}
            </p>

            <div className="product-actions">
                <button
                    onClick={() =>
                        navigate(`/products/${product._id}`)
                    }
                >
                    View product →
                </button>

                <button
                    className={`wishlist-button ${
                        isWishlisted ? "is-saved" : ""
                    }`}
                    onClick={handleToggleWishlist}
                    disabled={wishlistStatus === "saving"}
                >
                    {wishlistStatus === "saving"
                        ? "⏳ Saving..."
                        : isWishlisted
                            ? "♥ Remove from Wishlist"
                            : "♡ Add to Wishlist"}
                </button>

                {!inCart ? (
                    <button
                        className="cart-button"
                        onClick={handleAddToCart}
                        disabled={cartPending || outOfStock}
                    >
                        {outOfStock
                            ? "Out of Stock"
                            : cartPending
                                ? "Adding..."
                                : "Add to Cart"}
                    </button>
                ) : (
                    <div className="card-stepper">
                        <button
                            onClick={handleDecrement}
                            disabled={cartPending}
                            aria-label="Decrease quantity"
                            title={
                                inCartQuantity === 1
                                    ? "Remove from cart"
                                    : "Decrease quantity"
                            }
                        >
                            −
                        </button>

                        <span className="card-stepper-value">
                            {inCartQuantity}
                        </span>

                        <button
                            onClick={handleIncrement}
                            disabled={
                                cartPending || atStockLimit
                            }
                            aria-label="Increase quantity"
                            title={
                                atStockLimit
                                    ? "Stock limit reached"
                                    : "Increase quantity"
                            }
                        >
                            +
                        </button>
                    </div>
                )}
            </div>

            {atStockLimit && inCart && (
                <p className="cart-notice">
                    Stock limit reached ({product.stock})
                </p>
            )}

            {notice && (
                <p className="wishlist-notice">{notice}</p>
            )}

            {cartError && (
                <p className="wishlist-error">{cartError}</p>
            )}

            {wishlistStatus === "error" && (
                <p className="wishlist-error">
                    Unable to save product. Please try again.
                </p>
            )}
        </div>
    );
}

export default ProductCard;