import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import "./Wishlist.css";

function Wishlist() {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [removeError, setRemoveError] = useState("");
    const [removingId, setRemovingId] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchWishlist = async() => {
            try {
                const response = await api.get("/wishlist");

                if(!cancelled){
                    setWishlist(response.data.wishlist);
                }
            } catch (requestError) {
                if(requestError.response?.status === 401){
                    navigate("/login");
                    return;
                }

                if(!cancelled){
                    setError(true);
                }
            } finally {
                if(!cancelled){
                    setLoading(false);
                }
            }
        };

        fetchWishlist();

        return () => {
            cancelled = true;
        };
    }, [reloadKey, navigate]);

    const handleRetry = () => {
        setLoading(true);
        setError(false);
        setRemoveError("");
        setReloadKey((key) => key + 1);
    };

    const handleRemove = async(productId) => {
        setRemovingId(productId);
        setRemoveError("");

        try {
            await api.delete(`/wishlist/${productId}`);

            setWishlist((current) =>
                current.filter((product) => product._id !== productId)
            );
        } catch {
            setRemoveError(
                "Unable to remove this product. Please try again."
            );
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="wishlist-page">
            <Navbar wishlistCount={wishlist.length}/>

            <div className="wishlist-container">
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>

                    {!loading && !error && (
                        <p>
                            {wishlist.length}{" "}
                            {wishlist.length === 1
                                ? "product saved"
                                : "products saved"}
                        </p>
                    )}
                </div>

                {removeError && (
                    <p className="wishlist-error">
                        {removeError}
                    </p>
                )}

                {loading ? (
                    <p className="wishlist-state">
                        Loading your wishlist...
                    </p>
                ) : error ? (
                    <div className="wishlist-state">
                        <h2>Something went wrong.</h2>
                        <p>
                            We couldn't load your wishlist.
                        </p>
                        <button
                            className="wishlist-primary"
                            onClick={handleRetry}
                        >
                            Try Again
                        </button>
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="wishlist-state">
                        <p className="wishlist-heart">
                            &#10084;&#65039;
                        </p>
                        <h2>
                            Your wishlist is empty
                        </h2>
                        <p>
                            Save products you love and
                            find them here later.
                        </p>
                        <button
                            className="wishlist-primary"
                            onClick={() => navigate("/products")}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="wishlist-list">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                removing={removingId === product._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Wishlist;