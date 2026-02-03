import { loadStripe } from '@stripe/stripe-js';

// Sirsi Live Stripe Publishable Key (sirsi-nexus-live project)
const STRIPE_PUBLIC_KEY = 'pk_live_51ShDB5DHFENsYYPybmlWnIVtzmKszjTlH7aE4au2zDJmbZu40AiQXbz7sLtBtQlb2v30lNNEOJNw47UehrSzClc0000pJCYx5d';

export const getStripe = () => loadStripe(STRIPE_PUBLIC_KEY);

