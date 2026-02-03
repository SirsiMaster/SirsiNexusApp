import { loadStripe } from '@stripe/stripe-js';

// Using a placeholder public key - this should be in an environment variable
const STRIPE_PUBLIC_KEY = 'pk_test_51P2uJ5L2r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8r8f8';

export const getStripe = () => loadStripe(STRIPE_PUBLIC_KEY);
