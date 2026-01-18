/**
 * Stripe Payment Service
 * Handles subscription management and payment processing
 * @version 1.0.0
 */

class StripeService {
    constructor() {
        // Initialize with test keys (replace with your actual keys)
        this.publishableKey = 'pk_test_51OJ5KqSampleKeyHere'; // Replace with your key
        this.stripe = null;
        this.elements = null;
        this.initialized = false;
        
        // Subscription plans
        this.plans = {
            free: {
                id: 'free',
                name: 'Free',
                price: 0,
                priceId: null,
                features: [
                    '3 Projects',
                    '10,000 API Calls/month',
                    '1 GB Storage',
                    'Community Support',
                    'Basic Analytics'
                ]
            },
            starter: {
                id: 'starter',
                name: 'Starter',
                price: 29,
                priceId: 'price_starter_monthly', // Replace with your Stripe price ID
                features: [
                    '10 Projects',
                    '100,000 API Calls/month',
                    '10 GB Storage',
                    'Email Support',
                    'Advanced Analytics',
                    'Custom Domain'
                ]
            },
            professional: {
                id: 'professional',
                name: 'Professional',
                price: 99,
                priceId: 'price_professional_monthly', // Replace with your Stripe price ID
                features: [
                    'Unlimited Projects',
                    '1,000,000 API Calls/month',
                    '100 GB Storage',
                    'Priority Support',
                    'Advanced Analytics',
                    'Custom Domain',
                    'Team Collaboration',
                    'API Access'
                ]
            },
            enterprise: {
                id: 'enterprise',
                name: 'Enterprise',
                price: 'custom',
                priceId: null,
                features: [
                    'Unlimited Everything',
                    'Dedicated Support',
                    'Custom Integration',
                    'SLA Guarantee',
                    'On-premise Option',
                    'Custom Features'
                ]
            }
        };
    }

    /**
     * Initialize Stripe
     */
    async init() {
        if (this.initialized) return;

        try {
            // Load Stripe.js
            if (!window.Stripe) {
                await this.loadStripeJS();
            }

            // Initialize Stripe
            this.stripe = window.Stripe(this.publishableKey);
            this.elements = this.stripe.elements();
            
            this.initialized = true;
            console.log('Stripe service initialized');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
            throw error;
        }
    }

    /**
     * Load Stripe.js dynamically
     */
    async loadStripeJS() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Create checkout session for subscription
     */
    async createCheckoutSession(planId, userEmail) {
        if (!this.initialized) await this.init();

        const plan = this.plans[planId];
        if (!plan || !plan.priceId) {
            throw new Error('Invalid plan selected');
        }

        try {
            // Call your backend to create a checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    customerEmail: userEmail,
                    successUrl: `${window.location.origin}/dashboard/subscription-success.html`,
                    cancelUrl: `${window.location.origin}/dashboard/subscription.html`
                })
            });

            const session = await response.json();

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Checkout session error:', error);
            throw error;
        }
    }

    /**
     * Create payment element for custom payment form
     */
    createPaymentElement(containerId, options = {}) {
        if (!this.initialized) {
            console.error('Stripe not initialized');
            return null;
        }

        const appearance = {
            theme: 'stripe',
            variables: {
                colorPrimary: '#7c3aed',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorDanger: '#df1b41',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px'
            }
        };

        const elements = this.elements.create('payment', {
            ...options,
            appearance
        });

        const container = document.getElementById(containerId);
        if (container) {
            elements.mount(container);
        }

        return elements;
    }

    /**
     * Update subscription
     */
    async updateSubscription(subscriptionId, newPriceId) {
        try {
            const response = await fetch('/api/update-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    subscriptionId,
                    priceId: newPriceId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update subscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Update subscription error:', error);
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId) {
        try {
            const response = await fetch('/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({
                    subscriptionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Cancel subscription error:', error);
            throw error;
        }
    }

    /**
     * Get customer portal URL
     */
    async getCustomerPortalUrl() {
        try {
            const response = await fetch('/api/customer-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get customer portal URL');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Customer portal error:', error);
            throw error;
        }
    }

    /**
     * Get subscription status
     */
    async getSubscriptionStatus() {
        try {
            const response = await fetch('/api/subscription-status', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get subscription status');
            }

            return await response.json();
        } catch (error) {
            console.error('Get subscription status error:', error);
            throw error;
        }
    }

    /**
     * Get auth token (integrate with your auth service)
     */
    async getAuthToken() {
        // This should integrate with your auth service
        if (window.authService && window.authService.getCurrentUser()) {
            return await window.authService.getCurrentUser().getIdToken();
        }
        throw new Error('User not authenticated');
    }

    /**
     * Format price for display
     */
    formatPrice(amount, currency = 'USD') {
        if (typeof amount === 'string') return amount;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Create pricing table component
     */
    createPricingTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const pricingHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${Object.values(this.plans).map(plan => `
                    <div class="bg-white rounded-lg shadow-lg p-6 ${plan.id === 'professional' ? 'ring-2 ring-purple-600' : ''}">
                        ${plan.id === 'professional' ? '<div class="text-center mb-2"><span class="bg-purple-600 text-white px-3 py-1 rounded-full text-xs">MOST POPULAR</span></div>' : ''}
                        <h3 class="text-xl font-bold mb-2">${plan.name}</h3>
                        <div class="mb-4">
                            <span class="text-3xl font-bold">${this.formatPrice(plan.price)}</span>
                            ${plan.price !== 'custom' ? '<span class="text-gray-500">/month</span>' : ''}
                        </div>
                        <ul class="space-y-2 mb-6">
                            ${plan.features.map(feature => `
                                <li class="flex items-start">
                                    <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    <span class="text-sm">${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <button 
                            onclick="stripeService.selectPlan('${plan.id}')"
                            class="w-full py-2 px-4 rounded-lg font-semibold transition ${
                                plan.id === 'free' 
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                    : plan.id === 'enterprise'
                                    ? 'bg-gray-800 text-white hover:bg-gray-900'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                            }"
                        >
                            ${plan.id === 'free' ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = pricingHTML;
    }

    /**
     * Handle plan selection
     */
    async selectPlan(planId) {
        if (planId === 'free') {
            alert('You are already on the free plan');
            return;
        }

        if (planId === 'enterprise') {
            window.location.href = '/contact.html?subject=enterprise';
            return;
        }

        // Check if user is authenticated
        if (!window.authService || !window.authService.isAuthenticated()) {
            window.location.href = `/auth/login.html?redirect=/dashboard/subscription.html&plan=${planId}`;
            return;
        }

        try {
            const user = window.authService.getCurrentUser();
            await this.createCheckoutSession(planId, user.email);
        } catch (error) {
            console.error('Plan selection error:', error);
            alert('Failed to start checkout. Please try again.');
        }
    }

    /**
     * Handle webhook events (server-side)
     */
    async handleWebhook(event) {
        // This would be implemented on your server
        switch (event.type) {
            case 'checkout.session.completed':
                // Handle successful subscription
                await this.handleSubscriptionCreated(event.data.object);
                break;
            
            case 'customer.subscription.updated':
                // Handle subscription update
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            
            case 'customer.subscription.deleted':
                // Handle subscription cancellation
                await this.handleSubscriptionCancelled(event.data.object);
                break;
            
            case 'invoice.payment_failed':
                // Handle failed payment
                await this.handlePaymentFailed(event.data.object);
                break;
        }
    }

    /**
     * Mock functions for demonstration (implement on server)
     */
    async handleSubscriptionCreated(session) {
        console.log('Subscription created:', session);
        // Update user's subscription in Firestore
    }

    async handleSubscriptionUpdated(subscription) {
        console.log('Subscription updated:', subscription);
        // Update user's subscription in Firestore
    }

    async handleSubscriptionCancelled(subscription) {
        console.log('Subscription cancelled:', subscription);
        // Update user's subscription in Firestore
    }

    async handlePaymentFailed(invoice) {
        console.log('Payment failed:', invoice);
        // Send notification to user
    }
}

// Create global instance
window.stripeService = new StripeService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.stripeService.init().catch(console.error);
    });
} else {
    window.stripeService.init().catch(console.error);
}
