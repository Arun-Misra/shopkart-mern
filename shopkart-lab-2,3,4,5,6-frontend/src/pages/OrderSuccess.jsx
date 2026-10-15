import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./OrderSuccess.css";

function OrderSuccess() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${id}`);

                if (!cancelled) {
                    setOrder(response.data.order);
                }
            } catch {
                if (!cancelled) {
                    setError("Unable to load this order.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchOrder();

        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <div className="order-success-page">
            <Navbar/>

            <div className="order-success-container">
                {loading ? (
                    <p className="order-success-state">
                        Loading your order...
                    </p>
                ) : error || !order ? (
                    <div className="order-success-state-block">
                        <h2>
                            {error || "Order not found."}
                        </h2>
                    </div>
                ) : (
                    <>
                        <div className="order-success-header">
                            <h1>
                                Order Placed Successfully
                            </h1>
                            <p>
                                Thank you for shopping with
                                ShopKart.
                            </p>
                        </div>

                        <dl className="order-success-meta">
                            <div>
                                <dt>Order ID</dt>
                                <dd>{order._id}</dd>
                            </div>

                            <div>
                                <dt>Total</dt>
                                <dd>₹{order.totalAmount}</dd>
                            </div>

                            <div>
                                <dt>Status</dt>
                                <dd>
                                    <span className="order-success-badge">
                                        {order.status}
                                    </span>
                                </dd>
                            </div>
                        </dl>

                        <div className="order-success-actions">
                            <a
                                className="order-success-button"
                                href="/orders"
                            >
                                View My Orders
                            </a>

                            <a
                                className="order-success-button is-secondary"
                                href="/products"
                            >
                                Continue Shopping
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default OrderSuccess;