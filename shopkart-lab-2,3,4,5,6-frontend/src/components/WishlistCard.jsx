import { useNavigate } from "react-router-dom";

function WishlistCard({ product, onRemove, removing }) {
    const navigate = useNavigate();

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
                    View Details
                </button>

                <button
                    onClick={() => onRemove(product._id)}
                    disabled={removing}
                >
                    {removing
                        ? "Removing..."
                        : "Remove from Wishlist"}
                </button>
            </div>
        </div>
    );
}

export default WishlistCard;