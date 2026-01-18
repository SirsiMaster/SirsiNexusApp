// Chart.js optimizations and lazy loading
document.addEventListener('DOMContentLoaded', () => {
    // Chart configurations
    const chartConfigs = {
        timelineChart: {
            type: 'line',
            data: {
                labels: ['Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'],
                datasets: [{
                    label: 'Features Delivered',
                    data: [15, 28, 45, 62, 78, 95],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Customer Satisfaction',
                    data: [4.2, 4.5, 4.6, 4.7, 4.8, 4.9],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Features (%)',
                            color: '#10b981'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Satisfaction (1-5)',
                            color: '#3b82f6'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        min: 3,
                        max: 5
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Timeline'
                        }
                    }
                }
            }
        },
        fundingChart: {
            type: 'doughnut',
            data: {
                labels: ['Raised', 'Remaining Pre-Seed', 'Seed Target', 'Series A Target'],
                datasets: [{
                    data: [75000, 1425000, 6000000, 15000000],
                    backgroundColor: [
                        '#10b981',
                        '#f3f4f6',
                        '#3b82f6',
                        '#8b5cf6'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        }
    };

    // Create chart canvas and container
    const createChartCanvas = (id, width, height) => {
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = width;
        canvas.height = height;
        return canvas;
    };

    // Create chart section
    const createChartSection = (title, canvas, additionalContent = '') => {
        const section = document.createElement('section');
        section.className = 'bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm mb-8';
        section.innerHTML = `
            <h2 class="text-xl font-semibold mb-4 text-emerald-600">${title}</h2>
            <div class="chart-container">
                ${canvas.outerHTML}
            </div>
            ${additionalContent}
        `;
        return section;
    };

    // Initialize chart when it becomes visible
    const initializeChartWhenVisible = (chartId, config) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const canvas = document.getElementById(chartId);
                    if (canvas) {
                        new Chart(canvas, config);
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1
        });

        const chartContainer = document.getElementById(chartId)?.closest('.chart-container');
        if (chartContainer) {
            observer.observe(chartContainer);
        }
    };

    // Create and initialize Timeline Chart
    const createTimelineChart = () => {
        const canvas = createChartCanvas('timelineChart', 800, 400);
        const section = createChartSection('Development Timeline', canvas);
        
        const strategicOverview = document.querySelector('.bg-white.dark\\:bg-slate-800.border-b');
        if (strategicOverview) {
            strategicOverview.insertAdjacentElement('afterend', section);
            initializeChartWhenVisible('timelineChart', chartConfigs.timelineChart);
        }
    };

    // Create and initialize Funding Chart
    const createFundingChart = () => {
        const canvas = createChartCanvas('fundingChart', 400, 400);
        const additionalContent = `
            <div class="space-y-4 mt-6">
                <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <h3 class="font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Current Status</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">$75K raised of $1.5M Pre-Seed target</p>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                        <div class="bg-emerald-600 h-2 rounded-full" style="width: 5%"></div>
                    </div>
                </div>
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 class="font-semibold text-blue-700 dark:text-blue-400 mb-2">Next Milestone</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400">Pre-Seed round completion by Q1 2026</p>
                </div>
            </div>
        `;
        
        const section = createChartSection('Funding Progress', canvas, additionalContent);
        const timelineChart = document.getElementById('timelineChart')?.closest('section');
        if (timelineChart) {
            timelineChart.insertAdjacentElement('afterend', section);
            initializeChartWhenVisible('fundingChart', chartConfigs.fundingChart);
        }
    };

    // Initialize charts with a small delay to ensure DOM is ready
    setTimeout(() => {
        createTimelineChart();
        createFundingChart();
    }, 100);

    // Handle theme changes
    document.addEventListener('themeChanged', () => {
        const charts = Chart.instances;
        charts.forEach(chart => {
            chart.destroy();
        });
        createTimelineChart();
        createFundingChart();
    });
});
