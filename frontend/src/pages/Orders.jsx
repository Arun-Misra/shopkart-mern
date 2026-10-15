import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import "./Orders.css";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchOrders = async () => {
            try {
                const response = await api.get("/orders");

                if (!cancelled) {
                    setOrders(response.data.orders);
                    setError(false);
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    const handleRetry = () => {
        setLoading(true);
        setError(false);
        setReloadKey((key) => key + 1);
    };

const handleAdvanced = async (orderId) => {
      await api.post(`/orders/${orderId}/advance`);

      const refreshed = await api.get("/orders");

      setOrders(refreshed.data.orders);
    };

    const handleViewDetails = (orderId) => {
      navigate(`/orders/${orderId}`);
    };

    return (
        <div className="orders-page">
            <Navbar/>

            <div className="orders-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                </div>

                {loading ? (
                    <p className="orders-state">
                        Loading your orders...
                    </p>
                ) : error ? (
                    <div className="orders-state-block">
                        <h2>Unable to load your orders.</h2>
                        <p>
                            Something went wrong while
                            fetching your orders.
                        </p>
                        <button
                            className="orders-primary"
                            onClick={handleRetry}
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-state-block">
                        <h2>
                            You have not placed any orders yet.
                        </h2>
                        <button
                            className="orders-primary"
                            onClick={() => navigate("/products")}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
<OrderCard
                            key={order._id}
                            order={order}
                            onAdvanced={handleAdvanced}
                            onViewDetails={handleViewDetails}
                        />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;