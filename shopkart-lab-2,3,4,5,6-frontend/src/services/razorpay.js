const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");

    script.src = SCRIPT_SRC;
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      // Allow a later retry to re-attempt the load.
      scriptPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return scriptPromise;
};

export default loadRazorpayScript;