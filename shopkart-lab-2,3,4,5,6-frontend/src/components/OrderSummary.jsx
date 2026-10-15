function OrderSummary({ items, subtotal }) {
  return (
    <aside className="checkout-summary">
      <h2>Order Summary</h2>

      <div className="checkout-summary-items">
        {items.map((item) => (
          <div
            className="checkout-summary-item"
            key={item.product._id}
          >
            <div>
              <p className="checkout-summary-name">
                {item.product.name}
              </p>
              <p className="checkout-summary-qty">
                × {item.quantity}
              </p>
            </div>

            <p className="checkout-summary-price">
              ₹{item.product.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      <div className="checkout-summary-total">
        <span>Total</span>
        <span>₹{subtotal}</span>
      </div>

      <p className="checkout-summary-note">
        Final amount is calculated by the server.
      </p>
    </aside>
  );
}

export default OrderSummary;