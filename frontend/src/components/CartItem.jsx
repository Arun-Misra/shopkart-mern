import { useState } from "react";

function CartItem({ item, onUpdateQuantity, onRemove }) {
    const { product, quantity } = item;

    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const handleChange = async(nextQuantity) => {
        if(pending || nextQuantity < 1 || nextQuantity > product.stock){
            return;
        }

        setPending(true);
        setError("");

        try {
            await onUpdateQuantity(product._id, nextQuantity);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to update quantity."
            );
        } finally {
            setPending(false);
        }
    };

    const handleRemove = async() => {
        if(pending){
            return;
        }

        setPending(true);
        setError("");

        try {
            await onRemove(product._id);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "Unable to remove this product."
            );
            setPending(false);
        }
    };

    return (
        <div className="cart-item">
            <img
                className="cart-item-image"
                src={product.image}
                alt={product.name}
            />

            <div className="cart-item-info">
                <p className="product-category">
                    {product.category}
                </p>

                <h2>{product.name}</h2>

                <p className="cart-item-price">
                    ₹{product.price}
                </p>

                <p className="cart-item-stock">
                    {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of Stock"}
                </p>
            </div>

            <div className="cart-item-controls">
                <div className="quantity-control">
                    <button
                        onClick={() =>
                            handleChange(quantity - 1)
                        }
                        disabled={
                            pending || quantity <= 1
                        }
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <span className="quantity-value">
                        {quantity}
                    </span>

                    <button
                        onClick={() =>
                            handleChange(quantity + 1)
                        }
                        disabled={
                            pending ||
                            quantity >= product.stock
                        }
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>

                <p className="cart-item-total">
                    ₹{product.price * quantity}
                </p>

                <button
                    className="cart-item-remove"
                    onClick={handleRemove}
                    disabled={pending}
                >
                    {pending
                        ? "Working..."
                        : "Remove"}
                </button>

                {error && (
                    <p className="wishlist-error">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

export default CartItem;