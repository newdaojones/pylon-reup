export const checkoutConfig = {
  debug: false,
  acceptedPaymentMethods: ["Visa", "Mastercard"],
  publicKey: process.env.NEXT_PUBLIC_CHECKOUT_PUBLIC_KEY as string,
  style: {
    base: {
      fontSize: "18px",
      color: "white",
    },
    invalid: {
      color: "red",
    },
  },
};
