import Stripe from "stripe";

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
        if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
            console.error("STRIPE_SECRET_KEY is missing in production!");
        } else {
            console.warn("STRIPE_SECRET_KEY is missing. Stripe features will be disabled.");
        }
        // Return a dummy instance or null to avoid crashing during build
        // We use 'unused' as a placeholder to satisfy the Stripe constructor
        return new Stripe("unused", {
            apiVersion: "2026-02-25.clover" as any,
        });
    }

    return new Stripe(key, {
        apiVersion: "2026-02-25.clover" as any,
    });
};

export const stripe = getStripe();
export default stripe;
