// SirsiNexus Chart Component

class SirsiChart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chart = null;
        this._data = null;
        this._options = null;
    }

    static get observedAttributes() {
        return ['type', 'data', 'options'];
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        this.cleanup();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (name) {
                case 'data':
                    try {
                        this._data = JSON.parse(newValue);
                        this.updateChart();
                    } catch (e) {
                        console.error('Invalid chart data:', e);
                    }
                    break;
                case 'options':
                    try {
                        this._options = JSON.parse(newValue);
                        this.updateChart();
                    } catch (e) {
                        console.error('Invalid chart options:', e);
                    }
                    break;
                case 'type':
                    this.updateChart();
                    break;
            }
        }
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
        this.updateChart();
    }

    get options() {
        return this._options;
    }

    set options(value) {
        this._options = value;
        this.updateChart();
    }

    get type() {
        return this.getAttribute('type') || 'line';
    }

    set type(value) {
        this.setAttribute('type', value);
    }

    cleanup() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    getDefaultOptions() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            theme: isDark ? 'dark' : 'light',
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    bodyFont: {
                        family: "'Inter', sans-serif"
                    },
                    titleFont: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                }
            }
        };
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    min-height: 300px;
                }
                
                .chart-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                
                canvas {
                    width: 100% !important;
                    height: 100% !important;
                }
            </style>
            <div class="chart-container">
                <canvas></canvas>
            </div>
        `;

        this.canvas = this.shadowRoot.querySelector('canvas');
        this.updateChart();
    }

    updateChart() {
        if (!this.canvas || !this._data) return;

        // Cleanup existing chart
        this.cleanup();

        // Merge default options with custom options
        const chartOptions = {
            ...this.getDefaultOptions(),
            ...(this._options || {})
        };

        // Create new chart
        this.chart = new Chart(this.canvas.getContext('2d'), {
            type: this.type,
            data: this._data,
            options: chartOptions
        });

        // Register chart for cleanup
        if (typeof SirsiCleanup !== 'undefined') {
            SirsiCleanup.registerChart(this.chart);
        }
    }
}

// Register the component
if (!customElements.get('sirsi-chart')) {
    customElements.define('sirsi-chart', SirsiChart);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SirsiChart;
}
