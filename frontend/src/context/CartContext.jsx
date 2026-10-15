/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import api from "../services/api";

const CartContext = createContext(null);

function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [unauthorized, setUnauthorized] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadCart = async() => {
            try {
                const response = await api.get("/cart");

                if(!cancelled){
                    setCartItems(response.data.cart);
                    setUnauthorized(false);
                    setError("");
                }
            } catch (requestError) {
                if(cancelled){
                    return;
                }

                setCartItems([]);

                if(requestError.response?.status === 401){
                    setUnauthorized(true);
                } else {
                    setError("Unable to load your cart.");
                }
            } finally {
                if(!cancelled){
                    setLoading(false);
                }
            }
        };

        loadCart();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const refreshCart = useCallback(() => {
        setLoading(true);
        setError("");
        setUnauthorized(false);
        setReloadKey((key) => key + 1);
    }, []);

    // Used after a verified payment. The backend has already cleared the
    // cart, so this only mirrors that truth into the shared frontend state
    // without refetching.
    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const addToCart = useCallback(async(productId) => {
        const response = await api.post(`/cart/${productId}`);

        setCartItems(response.data.cart);

        return response.data;
    }, []);

    const updateQuantity = useCallback(async(productId, quantity) => {
        const response = await api.patch(
            `/cart/${productId}`,
            { quantity }
        );

        setCartItems(response.data.cart);

        return response.data;
    }, []);

    const removeFromCart = useCallback(async(productId) => {
        const response = await api.delete(`/cart/${productId}`);

        setCartItems(response.data.cart);

        return response.data;
    }, []);

    const subtotal = useMemo(
        () => cartItems.reduce(
            (total, item) =>
                total + item.product.price * item.quantity,
            0
        ),
        [cartItems]
    );

    const totalItems = useMemo(
        () => cartItems.reduce(
            (total, item) => total + item.quantity,
            0
        ),
        [cartItems]
    );

    const value = useMemo(
        () => ({
            cartItems,
            loading,
            error,
            unauthorized,
            subtotal,
            totalItems,
            refreshCart,
            clearCart,
            addToCart,
            updateQuantity,
            removeFromCart
        }),
        [
            cartItems,
            loading,
            error,
            unauthorized,
            subtotal,
            totalItems,
            refreshCart,
            clearCart,
            addToCart,
            updateQuantity,
            removeFromCart
        ]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

function useCart() {
    const context = useContext(CartContext);

    if(!context){
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}

export { CartProvider, useCart };
export default CartContext;