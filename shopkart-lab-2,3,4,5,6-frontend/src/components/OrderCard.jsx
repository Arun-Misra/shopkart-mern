import { useState } from "react";
import OrderStatus from "./OrderStatus";
import { STATUS_FLOW } from "../constants/orderStatus";

function OrderCard({ order, onAdvanced, onViewDetails }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  const isPaid = order.paymentStatus === "PAID";
  const isFinal = STATUS_FLOW.indexOf(order.status) === STATUS_FLOW.length - 1;

  const handleAdvance = async () => {
    if (pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      await onAdvanced(order._id);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Unable to update order status."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="orders-card">
      <header className="orders-card-head">
        <div>
          <h2>Order #{order._id}</h2>
          <p>{formatDate(order.createdAt)}</p>
        </div>

        <span className={`orders-status is-${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </header>

      <OrderStatus status={order.status} />

      <ul className="orders-card-items">
        {order.items.map((item, index) => (
          <li key={`${order._id}-${index}`}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <footer className="orders-card-foot">
        <p className="orders-card-total">
          Total: ₹{order.totalAmount}
        </p>

        <div className="orders-card-actions">
          {isPaid && !isFinal && (
            <button
              className="orders-advance"
              onClick={handleAdvance}
              disabled={pending}
            >
              {pending
                ? "Updating..."
                : `Mark ${STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}`}
            </button>
          )}

          <button onClick={() => onViewDetails(order._id)}>
            View Details
          </button>
        </div>
      </footer>

      {error && (
        <p className="orders-card-error">{error}</p>
      )}
    </article>
  );
}

export default OrderCard;