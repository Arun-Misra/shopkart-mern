import { STATUS_FLOW } from "../constants/orderStatus";

function OrderStatus({ status }) {
  const currentIndex = STATUS_FLOW.indexOf(status);

  // Pending payment orders are not part of the progression.
  if (currentIndex === -1) {
    return <span className="order-status is-pending">{status}</span>;
  }

  return (
    <ol className="order-status-track">
      {STATUS_FLOW.map((step, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step}
            className={[
              "order-status-step",
              reached ? "is-reached" : "",
              isCurrent ? "is-current" : ""
            ].join(" ").trim()}
          >
            <span className="order-status-dot" />
            <span className="order-status-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default OrderStatus;