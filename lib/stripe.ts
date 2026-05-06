import Stripe from "stripe";

const createMockStripe = () => {
    return new Proxy({} as any, {
        get() {
            return createMockStripe();
        },
        apply() {
            return createMockStripe();
        }
    });
};

const getStripeInstance = () => {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key || key === "undefined") {
        if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
            console.error("STRIPE_SECRET_KEY is missing!");
        }
        // Return a mock that won't crash when properties are accessed
        return createMockStripe();
    }

    try {
        return new Stripe(key, {
            apiVersion: "2026-02-25.clover" as any,
        });
    } catch (err) {
        console.error("Failed to initialize Stripe:", err);
        return createMockStripe();
    }
};

// Defer initialization until first access
let instance: any = null;

export const stripe = new Proxy({} as Stripe, {
    get(target, prop, receiver) {
        if (!instance) instance = getStripeInstance();
        return Reflect.get(instance, prop, receiver);
    }
});

export default stripe;
