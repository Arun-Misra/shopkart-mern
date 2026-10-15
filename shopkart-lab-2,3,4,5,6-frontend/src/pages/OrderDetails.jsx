import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import OrderStatus from "../components/OrderStatus";
import "./OrderDetails.css";

function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [advancing, setAdvancing] = useState(false);
    const [advanceError, setAdvanceError] = useState("");

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

    const formatDate = (value) =>
        new Date(value).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    const handleAdvance = async() => {
        setAdvancing(true);
        setAdvanceError("");

        try {
            const response = await api.post(`/orders/${id}/advance`);

            setOrder(response.data.order);
        } catch (requestError) {
            setAdvanceError(
                requestError.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setAdvancing(false);
        }
    };

    return (
        <div className="order-details-page">
            <Navbar/>

            <div className="order-details-container">
                {loading ? (
                    <p className="order-details-state">
                        Loading order...
                    </p>
                ) : error || !order ? (
                    <div className="order-details-state-block">
                        <h2>{error || "Order not found."}</h2>
                    </div>
                ) : (
                    <>
                        <div className="order-details-header">
                            <div className="order-details-headline">
                                <div>
                                    <h1>Order #{order._id}</h1>
                                    <p>
                                        Placed on{" "}
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>

                                {order.paymentStatus === "PAID" && (
                                    <button
                                        className="order-details-advance"
                                        onClick={handleAdvance}
                                        disabled={advancing}
                                    >
                                        {advancing
                                            ? "Updating..."
                                            : "Advance Status"}
                                    </button>
                                )}
                            </div>

                            <OrderStatus status={order.status} />

                            {advanceError && (
                                <p className="order-details-advance-error">
                                    {advanceError}
                                </p>
                            )}
                        </div>

                        <div className="order-details-grid">
                            <section className="order-details-items">
                                <h2>Items</h2>

                                {order.items.map((item, index) => (
                                    <div
                                        className="order-details-item"
                                        key={`${item.product}-${index}`}
                                    >
                                        <div>
                                            <p className="order-details-name">
                                                {item.name}
                                            </p>
                                            <p className="order-details-qty">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="order-details-price">
                                                ₹{item.price}
                                            </p>
                                        </div>

                                        <p className="order-details-line-total">
                                            ₹{item.price * item.quantity}
                                        </p>
                                    </div>
                                ))}

                                <div className="order-details-total">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>
                            </section>

                            <aside className="order-details-side">
                                <section>
                                    <h2>Shipping Address</h2>
                                    <p>
                                        {order.shippingAddress?.fullName}
                                    </p>
                                    <p>
                                        {order.shippingAddress?.addressLine1}
                                    </p>
                                    <p>
                                        {order.shippingAddress?.city},{" "}
                                        {order.shippingAddress?.state}
                                    </p>
                                    <p>
                                        {order.shippingAddress?.pincode}
                                    </p>
                                    <p>
                                        {order.shippingAddress?.phone}
                                    </p>
                                </section>

                                <section>
                                    <h2>Payment</h2>
                                    <p>
                                        Status: {order.paymentStatus}
                                    </p>
                                    <p>
                                        Order: {order.status}
                                    </p>
                                    {order.razorpayPaymentId && (
                                        <p className="order-details-ref">
                                            Payment ID:{" "}
                                            {order.razorpayPaymentId}
                                        </p>
                                    )}
                                </section>
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default OrderDetails;