import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [cartPending, setCartPending] = useState(false);
    const [cartError, setCartError] = useState("");

    const [wishlistIds, setWishlistIds] = useState([]);
    const [wishlistStatus, setWishlistStatus] = useState("idle");
    const [wishlistError, setWishlistError] = useState("");

    const wishlistTimer = useRef(null);

    useEffect(() => {
        return () => clearTimeout(wishlistTimer.current);
    }, []);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await api.get("/wishlist");

                setWishlistIds(
                    response.data.wishlist.map((item) => item._id)
                );
            } catch {
                setWishlistIds([]);
            }
        };

        fetchWishlist();
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);

                setProduct(response.data.product);
            } catch {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const inCartQuantity = product
        ? cartItems.find(
            (item) => item.product._id === product._id
        )?.quantity ?? 0
        : 0;

    const outOfStock = product ? product.stock < 1 : false;
    const atStockLimit = product
        ? inCartQuantity >= product.stock
        : false;

    const isWishlisted = product
        ? wishlistIds.includes(product._id)
        : false;

    const handleToggleWishlist = async() => {
        if(wishlistStatus === "saving"){
            return;
        }

        setWishlistStatus("saving");
        setWishlistError("");

        try {
            const response = await api.patch(
                `/wishlist/${product._id}/toggle`
            );

            setWishlistIds((current) =>
                response.data.saved
                    ? [...current, product._id]
                    : current.filter((entry) => entry !== product._id)
            );

            setWishlistStatus("saved");

            clearTimeout(wishlistTimer.current);
            wishlistTimer.current = setTimeout(
                () => setWishlistStatus("idle"),
                2000
            );
        } catch (requestError) {
            setWishlistStatus("error");
            setWishlistError(
                requestError.response?.data?.message ||
                "Unable to update your wishlist."
            );
        }
    };

    const wishlistButtonLabel = wishlistStatus === "saving"
        ? "⏳ Saving..."
        : wishlistStatus === "saved"
            ? isWishlisted
                ? "♥ Saved to Wishlist"
                : "Removed from Wishlist"
            : isWishlisted
                ? "♥ Remove from Wishlist"
                : "♡ Add to Wishlist";

    const handleAddToCart = async () => {
        if(cartPending || outOfStock){
            return;
        }

        setCartPending(true);
        setCartError("");

        try {
            await addToCart(product._id);
        } catch (requestError) {
            setCartError(
                requestError.response?.data?.message ||
                "Unable to add this product to your cart."
            );
        } finally {
            setCartPending(false);
        }
    };

    const handleIncrement = async () => {
        if(cartPending || atStockLimit){
            return;
        }

        setCartPending(true);
        setCartError("");

        try {
            await updateQuantity(product._id, inCartQuantity + 1);
        } catch (requestError) {
            setCartError(
                requestError.response?.data?.message ||
                "Unable to update your cart."
            );
        } finally {
            setCartPending(false);
        }
    };

    const handleDecrement = async () => {
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
            setCartError(
                requestError.response?.data?.message ||
                "Unable to update your cart."
            );
        } finally {
            setCartPending(false);
        }
    };

    const cartButtonLabel = outOfStock
        ? "Out of Stock"
        : cartPending
            ? "Adding..."
            : "Add to Cart";

    return (
        <div className="product-details-page">
            <Navbar wishlistCount={wishlistIds.length}/>

            <div className="product-details-container">
                {loading ? (
                    <p className="product-details-loading">
                        Loading product...
                    </p>
                ) : error || !product ? (
                    <p className="product-details-loading">
                        {error || "Product not found."}
                    </p>
                ) : (
                    <div className="product-details">

                        <img
                            className="product-details-image"
                            src={product.image}
                            alt={product.name}
                        />

                        <div className="product-details-info">

                            <p className="product-details-category">
                                {product.category}
                            </p>

                            <h1>{product.name}</h1>

                            <p className="product-details-description">
                                {product.description}
                            </p>

                            <p className="product-details-price">
                                ₹{product.price}
                            </p>

                            <p className="product-details-stock">
                                {product.stock > 0
                                    ? `${product.stock} units available`
                                    : "Out of Stock"}
                            </p>

                            {inCartQuantity > 0 ? (
                                <div className="details-stepper">
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

                                    <span className="details-stepper-value">
                                        {inCartQuantity}
                                    </span>

                                    <button
                                        onClick={handleIncrement}
                                        disabled={
                                            cartPending ||
                                            atStockLimit
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
                            ) : (
                                <button
                                    className="add-to-cart"
                                    onClick={handleAddToCart}
                                    disabled={
                                        cartPending || outOfStock
                                    }
                                >
                                    {cartButtonLabel}
                                </button>
                            )}

                            {atStockLimit && inCartQuantity > 0 && (
                                <p className="product-details-hint">
                                    Stock limit reached (
                                    {product.stock})
                                </p>
                            )}

                            {cartError && (
                                <p className="product-details-error">
                                    {cartError}
                                </p>
                            )}

                            <div className="product-details-secondary">
                                <button
                                    className={`wishlist-toggle ${
                                        isWishlisted ? "is-saved" : ""
                                    }`}
                                    onClick={handleToggleWishlist}
                                    disabled={
                                        wishlistStatus === "saving"
                                    }
                                >
                                    {wishlistButtonLabel}
                                </button>
                            </div>

                            {wishlistError && (
                                <p className="product-details-error">
                                    {wishlistError}
                                </p>
                            )}

                            <div className="product-details-cartline">
                                {inCartQuantity > 0 ? (
                                    <>
                                        <span>
                                            In your cart:{" "}
                                            {inCartQuantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                navigate("/cart")
                                            }
                                        >
                                            View Cart →
                                        </button>
                                    </>
                                ) : (
                                    <span>
                                        Not in your cart yet.
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetails;