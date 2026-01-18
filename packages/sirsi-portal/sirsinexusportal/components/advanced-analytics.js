/**
 * Advanced Analytics Module for SirsiNexus
 * Uses D3.js for sophisticated data visualizations
 * @version 1.0.0
 */

class AdvancedAnalytics {
    constructor() {
        this.charts = {};
        this.colorSchemes = {
            emerald: ['#064e3b', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
            blue: ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93bbfc', '#c3dafe'],
            mixed: ['#059669', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444']
        };
        this.margins = { top: 40, right: 40, bottom: 60, left: 60 };
    }

    /**
     * Initialize all advanced visualizations
     */
    async initializeVisualizations() {
        // Ensure D3 is available
        if (typeof d3 === 'undefined') {
            console.error('D3.js is not loaded');
            return;
        }

        // Initialize Analytics API
        this.analyticsAPI = new window.AnalyticsAPI();
        
        // Initialize different visualization types
        await this.createUserBehaviorHeatmap();
        await this.createRevenueTreemap();
        await this.createUserJourneyFlow();
        await this.createEngagementRadar();
        await this.createRealTimeStreamGraph();
        await this.createGeographicDistribution();
    }

    /**
     * Create a heatmap showing user activity patterns
     */
    async createUserBehaviorHeatmap() {
        const container = d3.select('#heatmap-container');
        if (container.empty()) return;

        // Sample data structure for user behavior heatmap
        const data = this.generateHeatmapData();
        
        const width = container.node().getBoundingClientRect().width;
        const height = 400;
        
        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(d3.range(24))
            .range([0, width - this.margins.left - this.margins.right])
            .padding(0.05);

        const yScale = d3.scaleBand()
            .domain(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
            .range([height - this.margins.top - this.margins.bottom, 0])
            .padding(0.05);

        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateViridis)
            .domain([0, d3.max(data, d => d.value)]);

        // Create heatmap cells
        g.selectAll('.heat-cell')
            .data(data)
            .enter().append('rect')
            .attr('class', 'heat-cell')
            .attr('x', d => xScale(d.hour))
            .attr('y', d => yScale(d.day))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.value))
            .attr('rx', 4)
            .on('mouseover', this.showTooltip)
            .on('mouseout', this.hideTooltip);

        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${height - this.margins.top - this.margins.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d => `${d}:00`));

        g.append('g')
            .call(d3.axisLeft(yScale));

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('User Activity Heatmap');

        this.charts.heatmap = { svg, data, scales: { x: xScale, y: yScale, color: colorScale } };
    }

    /**
     * Create a treemap showing revenue distribution
     */
    async createRevenueTreemap() {
        const container = d3.select('#treemap-container');
        if (container.empty()) return;

        const width = container.node().getBoundingClientRect().width;
        const height = 500;

        const data = this.generateTreemapData();

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create hierarchy
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        // Create treemap layout
        d3.treemap()
            .size([width, height])
            .padding(2)
            .round(true)(root);

        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(root.children.map(d => d.data.name))
            .range(this.colorSchemes.mixed);

        // Create cells
        const cell = svg.selectAll('g')
            .data(root.leaves())
            .enter().append('g')
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        cell.append('rect')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => colorScale(d.parent.data.name))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('rx', 4);

        cell.append('text')
            .attr('x', 4)
            .attr('y', 20)
            .text(d => d.data.name)
            .style('font-size', '12px')
            .style('fill', 'white');

        cell.append('text')
            .attr('x', 4)
            .attr('y', 35)
            .text(d => `$${d.value.toLocaleString()}`)
            .style('font-size', '10px')
            .style('fill', 'white')
            .style('opacity', 0.8);

        this.charts.treemap = { svg, data, root };
    }

    /**
     * Create a Sankey diagram for user journey flow
     */
    async createUserJourneyFlow() {
        const container = d3.select('#sankey-container');
        if (container.empty()) return;

        const width = container.node().getBoundingClientRect().width;
        const height = 600;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        // Generate sample Sankey data
        const data = this.generateSankeyData();

        // Create Sankey layout
        const sankey = d3.sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [width - 1, height - 6]]);

        const { nodes, links } = sankey(data);

        // Add links
        svg.append('g')
            .selectAll('path')
            .data(links)
            .join('path')
            .attr('d', d3.sankeyLinkHorizontal())
            .attr('stroke', '#059669')
            .attr('stroke-width', d => Math.max(1, d.width))
            .attr('fill', 'none')
            .attr('opacity', 0.5);

        // Add nodes
        svg.append('g')
            .selectAll('rect')
            .data(nodes)
            .join('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', '#10b981')
            .append('title')
            .text(d => `${d.name}: ${d.value.toLocaleString()}`);

        // Add node labels
        svg.append('g')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr('y', d => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
            .text(d => d.name)
            .style('font-size', '12px');

        this.charts.sankey = { svg, data, sankey };
    }

    /**
     * Create a radar chart for engagement metrics
     */
    async createEngagementRadar() {
        const container = d3.select('#radar-container');
        if (container.empty()) return;

        const width = 500;
        const height = 500;
        const radius = Math.min(width, height) / 2 - 50;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width/2},${height/2})`);

        // Sample data
        const data = [
            { axis: 'User Retention', value: 0.85 },
            { axis: 'Page Views', value: 0.72 },
            { axis: 'Session Duration', value: 0.68 },
            { axis: 'Feature Adoption', value: 0.90 },
            { axis: 'Support Tickets', value: 0.45 },
            { axis: 'User Satisfaction', value: 0.88 }
        ];

        const angleSlice = Math.PI * 2 / data.length;

        // Scales
        const rScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, radius]);

        // Draw grid circles
        const levels = 5;
        for (let level = 0; level < levels; level++) {
            g.append('circle')
                .attr('r', radius / levels * (level + 1))
                .style('fill', 'none')
                .style('stroke', '#e5e7eb')
                .style('stroke-width', 1);
        }

        // Draw axes
        const axis = g.selectAll('.axis')
            .data(data)
            .enter().append('g')
            .attr('class', 'axis');

        axis.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .style('stroke', '#e5e7eb')
            .style('stroke-width', 1);

        axis.append('text')
            .attr('x', (d, i) => rScale(1.2) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => rScale(1.2) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(d => d.axis)
            .style('font-size', '12px');

        // Draw the radar area
        const radarLine = d3.lineRadial()
            .radius(d => rScale(d.value))
            .angle((d, i) => i * angleSlice);

        g.append('path')
            .datum(data)
            .attr('d', radarLine)
            .attr('fill', '#059669')
            .attr('fill-opacity', 0.3)
            .attr('stroke', '#059669')
            .attr('stroke-width', 2);

        // Add dots
        g.selectAll('.radar-dot')
            .data(data)
            .enter().append('circle')
            .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('r', 4)
            .attr('fill', '#059669');

        this.charts.radar = { svg, data };
    }

    /**
     * Create a real-time stream graph
     */
    async createRealTimeStreamGraph() {
        const container = d3.select('#stream-container');
        if (container.empty()) return;

        const width = container.node().getBoundingClientRect().width;
        const height = 400;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);

        // Generate initial data
        const data = this.generateStreamData();
        const keys = Object.keys(data[0]).filter(k => k !== 'date');

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width - this.margins.left - this.margins.right]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d3.sum(keys, k => d[k]))])
            .range([height - this.margins.top - this.margins.bottom, 0]);

        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range(this.colorSchemes.emerald);

        // Stack the data
        const stack = d3.stack()
            .keys(keys)
            .offset(d3.stackOffsetWiggle);

        const series = stack(data);

        // Area generator
        const area = d3.area()
            .x(d => xScale(d.data.date))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveCardinal);

        // Draw the streams
        g.selectAll('.stream')
            .data(series)
            .enter().append('path')
            .attr('class', 'stream')
            .attr('d', area)
            .attr('fill', d => colorScale(d.key))
            .attr('opacity', 0.8);

        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${height - this.margins.top - this.margins.bottom})`)
            .call(d3.axisBottom(xScale));

        g.append('g')
            .call(d3.axisLeft(yScale));

        this.charts.stream = { svg, data, scales: { x: xScale, y: yScale }, area, stack };

        // Start real-time updates
        this.startStreamUpdates();
    }

    /**
     * Create geographic distribution map
     */
    async createGeographicDistribution() {
        const container = d3.select('#map-container');
        if (container.empty()) return;

        const width = container.node().getBoundingClientRect().width;
        const height = 500;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        // For this example, we'll create a bubble chart representing different regions
        const data = this.generateGeographicData();

        // Create a simple bubble chart as placeholder for geographic data
        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2).strength(0.05))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('collide', d3.forceCollide(d => d.radius + 2));

        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.region))
            .range(this.colorSchemes.mixed);

        const bubbles = svg.selectAll('.bubble')
            .data(data)
            .enter().append('g')
            .attr('class', 'bubble');

        bubbles.append('circle')
            .attr('r', d => d.radius)
            .attr('fill', d => colorScale(d.region))
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        bubbles.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text(d => d.code)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'white');

        simulation.on('tick', () => {
            bubbles.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        this.charts.geographic = { svg, data, simulation };
    }

    /**
     * Helper methods for generating sample data
     */
    generateHeatmapData() {
        const data = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        days.forEach(day => {
            for (let hour = 0; hour < 24; hour++) {
                data.push({
                    day: day,
                    hour: hour,
                    value: Math.random() * 100
                });
            }
        });
        
        return data;
    }

    generateTreemapData() {
        return {
            name: 'Revenue',
            children: [
                {
                    name: 'Subscriptions',
                    children: [
                        { name: 'Basic Plan', value: 125000 },
                        { name: 'Pro Plan', value: 280000 },
                        { name: 'Enterprise', value: 450000 }
                    ]
                },
                {
                    name: 'Services',
                    children: [
                        { name: 'Consulting', value: 180000 },
                        { name: 'Training', value: 95000 },
                        { name: 'Support', value: 145000 }
                    ]
                },
                {
                    name: 'Products',
                    children: [
                        { name: 'Add-ons', value: 85000 },
                        { name: 'Integrations', value: 110000 }
                    ]
                }
            ]
        };
    }

    generateSankeyData() {
        const nodes = [
            { name: 'Homepage' },
            { name: 'Product Page' },
            { name: 'Documentation' },
            { name: 'Sign Up' },
            { name: 'Trial' },
            { name: 'Purchase' },
            { name: 'Support' },
            { name: 'Churn' }
        ];

        const links = [
            { source: 0, target: 1, value: 1000 },
            { source: 0, target: 2, value: 500 },
            { source: 0, target: 3, value: 800 },
            { source: 1, target: 3, value: 600 },
            { source: 1, target: 4, value: 400 },
            { source: 2, target: 6, value: 300 },
            { source: 3, target: 4, value: 900 },
            { source: 4, target: 5, value: 700 },
            { source: 4, target: 7, value: 200 },
            { source: 5, target: 6, value: 150 }
        ];

        return { nodes, links };
    }

    generateStreamData() {
        const categories = ['Documents', 'Users', 'Sessions', 'Transactions'];
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < 50; i++) {
            const point = {
                date: new Date(now.getTime() - (50 - i) * 60000)
            };
            
            categories.forEach(cat => {
                point[cat] = Math.random() * 50 + 20;
            });
            
            data.push(point);
        }
        
        return data;
    }

    generateGeographicData() {
        return [
            { region: 'North America', code: 'NA', value: 450000, radius: 60 },
            { region: 'Europe', code: 'EU', value: 380000, radius: 55 },
            { region: 'Asia Pacific', code: 'APAC', value: 320000, radius: 50 },
            { region: 'Latin America', code: 'LATAM', value: 180000, radius: 35 },
            { region: 'Middle East', code: 'ME', value: 120000, radius: 30 },
            { region: 'Africa', code: 'AF', value: 95000, radius: 25 }
        ];
    }

    /**
     * Real-time update for stream graph
     */
    startStreamUpdates() {
        setInterval(() => {
            if (!this.charts.stream) return;

            const { data, scales, area, stack } = this.charts.stream;
            const keys = Object.keys(data[0]).filter(k => k !== 'date');
            
            // Remove oldest data point and add new one
            data.shift();
            const newPoint = {
                date: new Date()
            };
            
            keys.forEach(key => {
                newPoint[key] = Math.random() * 50 + 20;
            });
            
            data.push(newPoint);

            // Update scales
            scales.x.domain(d3.extent(data, d => d.date));
            
            // Update the visualization
            const series = stack(data);
            
            d3.select(this.charts.stream.svg.node())
                .selectAll('.stream')
                .data(series)
                .transition()
                .duration(1000)
                .attr('d', area);
        }, 3000);
    }

    /**
     * Tooltip functions
     */
    showTooltip(event, d) {
        const tooltip = d3.select('body').append('div')
            .attr('class', 'analytics-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', '#1e293b')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');

        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);

        tooltip.html(`Value: ${d.value}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    hideTooltip() {
        d3.selectAll('.analytics-tooltip').remove();
    }

    /**
     * Export functionality for charts
     */
    exportChart(chartName, format = 'png') {
        const chart = this.charts[chartName];
        if (!chart || !chart.svg) return;

        // Implementation would depend on the specific export library used
        // For now, we'll log the intention
        console.log(`Exporting ${chartName} as ${format}`);
    }

    /**
     * Cleanup
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart.svg) {
                chart.svg.remove();
            }
        });
        this.charts = {};
    }
}

// Export for use
window.AdvancedAnalytics = AdvancedAnalytics;
