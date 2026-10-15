import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";


function Navbar({ tagline, wishlistCount }) {
    const navigate = useNavigate();
    const { totalItems, refreshCart } = useCart();

    const [fetchedCount, setFetchedCount] = useState(null);

    useEffect(() => {
        if(wishlistCount !== undefined){
            return;
        }

        let cancelled = false;

        const fetchCount = async() => {
            try {
                const response = await api.get("/wishlist");

                if(!cancelled){
                    setFetchedCount(response.data.count);
                }
            } catch {
                if(!cancelled){
                    setFetchedCount(0);
                }
            }
        };

        fetchCount();

        return () => {
            cancelled = true;
        };
    }, [wishlistCount]);

    const count = wishlistCount !== undefined ? wishlistCount : fetchedCount;

    const handleLogout = async()=>{
    try {
        await api.post("/customers/logout");

        refreshCart();
        setFetchedCount(0);

        navigate("/login");

    } catch (error) {
        console.log(error);
    }
};
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h2 className="navbar-logo">ShopKart</h2>

                {tagline && (
                    <p className="navbar-tagline">{tagline}</p>
                )}
            </div>

            <div className="navbar-links">
                <button onClick={() => navigate("/home")}>
                    Home
                </button>

                <button onClick={() => navigate("/products")}>
                    Products
                </button>

                <button onClick={() => navigate("/wishlist")}>
                    Wishlist{count !== null && ` (${count})`}
                </button>

                <button onClick={() => navigate("/cart")}>
                    Cart ({totalItems})
                </button>

                <button onClick={() => navigate("/orders")}>
                    Orders
                </button>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;