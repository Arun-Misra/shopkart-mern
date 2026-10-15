function CheckoutForm({ values, errors, onChange, onSubmit, placing }) {
  const fields = [
    { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
    { name: "addressLine1", label: "Address", type: "text", autoComplete: "address-line1" },
    { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
    { name: "state", label: "State", type: "text", autoComplete: "address-level1" },
    { name: "pincode", label: "Pincode", type: "text", autoComplete: "postal-code" }
  ];

  return (
    <form className="checkout-form" onSubmit={onSubmit} noValidate>
      {fields.map((field) => (
        <div className="checkout-field" key={field.name}>
          <label htmlFor={field.name}>
            {field.label}
          </label>

          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={(event) =>
              onChange(field.name, event.target.value)
            }
            aria-invalid={Boolean(errors[field.name])}
          />

          {errors[field.name] && (
            <p className="checkout-field-error">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        className="checkout-submit"
        disabled={placing}
      >
        {placing ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  );
}

export default CheckoutForm;