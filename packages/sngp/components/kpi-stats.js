/**
 * KPI Stats Component for SirsiNexus
 * Provides responsive layout for KPI statistics
 */

class KPIStats extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('/assets/css/common-styles.css');
                
                :host {
                    display: block;
                    width: 100%;
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    padding: 1rem;
                }

                @media (max-width: 640px) {
                    .kpi-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .kpi-card {
                    background: var(--card-bg, white);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .kpi-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                }

                .kpi-label {
                    color: var(--text-secondary, #666);
                    font-size: 0.875rem;
                }

                .kpi-trend {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                }

                .trend-up {
                    color: var(--trend-up, #10B981);
                }

                .trend-down {
                    color: var(--trend-down, #EF4444);
                }
            </style>

            <div class="kpi-grid">
                <slot></slot>
            </div>
        `;
    }

    // Method to add a new KPI stat
    addStat(label, value, trend = null) {
        const stat = document.createElement('div');
        stat.className = 'kpi-card';
        
        const trendHTML = trend ? `
            <div class="kpi-trend ${trend.direction === 'up' ? 'trend-up' : 'trend-down'}">
                ${trend.direction === 'up' ? '↑' : '↓'} ${trend.value}
            </div>
        ` : '';

        stat.innerHTML = `
            <div class="kpi-value">${value}</div>
            <div class="kpi-label">${label}</div>
            ${trendHTML}
        `;

        this.shadowRoot.querySelector('.kpi-grid').appendChild(stat);
    }
}

// Define the custom element
customElements.define('kpi-stats', KPIStats);
