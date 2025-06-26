// D3.js Chart Library for Dimensional Dashboard

// Chart dimensions and margins
const margin = { top: 20, right: 30, bottom: 40, left: 50 };

// Color palette
const colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    palette: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6']
};

// Initialize all charts
function initializeCharts() {
    // Initialize sparklines for KPI cards
    initializeSparklines();
    
    // Initialize main charts
    initializeLineChart();
    initializeBarChart();
    initializePieChart();
    initializeHeatmap();
    initializeScatterPlot();
}

// Sparkline charts for KPI cards
function initializeSparklines() {
    const sparklineData = generateSparklineData(20);
    
    ['revenue', 'users', 'conversion', 'performance'].forEach((metric, index) => {
        const container = document.getElementById(`${metric}-spark`);
        if (!container) return;
        
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const xScale = d3.scaleLinear()
            .domain([0, sparklineData.length - 1])
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(sparklineData, d => d.value))
            .range([height - 5, 5]);
        
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        const area = d3.area()
            .x((d, i) => xScale(i))
            .y0(height)
            .y1(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        // Add gradient
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', `gradient-${metric}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', 0).attr('y2', height);
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colors.primary)
            .attr('stop-opacity', 0.3);
        
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colors.primary)
            .attr('stop-opacity', 0);
        
        // Add area
        svg.append('path')
            .datum(sparklineData)
            .attr('fill', `url(#gradient-${metric})`)
            .attr('d', area);
        
        // Add line
        svg.append('path')
            .datum(sparklineData)
            .attr('fill', 'none')
            .attr('stroke', colors.primary)
            .attr('stroke-width', 2)
            .attr('d', line);
    });
}

// Line Chart - Revenue Trends
function initializeLineChart() {
    const container = document.getElementById('line-chart');
    if (!container) return;
    
    const width = container.parentElement.offsetWidth - margin.left - margin.right;
    const height = 250;
    
    const svg = d3.select(container)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate data
    const data = generateTimeSeriesData(30);
    
    // Scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);
    
    // Line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    // Area generator
    const area = d3.area()
        .x(d => xScale(d.date))
        .y0(height)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    // Add gradient
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'line-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', height);
    
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors.primary)
        .attr('stop-opacity', 0.3);
    
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors.primary)
        .attr('stop-opacity', 0);
    
    // Add area
    g.append('path')
        .datum(data)
        .attr('fill', 'url(#line-gradient)')
        .attr('d', area);
    
    // Add line
    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 3)
        .attr('d', line);
    
    // Add dots
    g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', colors.primary)
        .style('opacity', 0)
        .on('mouseover', function(event, d) {
            d3.select(this).style('opacity', 1);
            showTooltip(event, `$${d.value.toLocaleString()}`);
        })
        .on('mouseout', function() {
            d3.select(this).style('opacity', 0);
            hideTooltip();
        });
    
    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d')));
    
    g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d / 1000}k`));
}

// Bar Chart - Product Performance
function initializeBarChart() {
    const container = document.getElementById('bar-chart');
    if (!container) return;
    
    const width = container.parentElement.offsetWidth - margin.left - margin.right;
    const height = 250;
    
    const svg = d3.select(container)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Data
    const data = [
        { product: 'Product A', value: 45000 },
        { product: 'Product B', value: 38000 },
        { product: 'Product C', value: 52000 },
        { product: 'Product D', value: 31000 },
        { product: 'Product E', value: 42000 }
    ];
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.product))
        .range([0, width])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);
    
    // Create bars
    g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.product))
        .attr('width', xScale.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', colors.primary)
        .attr('rx', 4)
        .transition()
        .duration(1000)
        .attr('y', d => yScale(d.value))
        .attr('height', d => height - yScale(d.value));
    
    // Add hover effects
    g.selectAll('.bar')
        .on('mouseover', function(event, d) {
            d3.select(this).attr('fill', colors.secondary);
            showTooltip(event, `${d.product}: $${d.value.toLocaleString()}`);
        })
        .on('mouseout', function() {
            d3.select(this).attr('fill', colors.primary);
            hideTooltip();
        });
    
    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    
    g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d / 1000}k`));
}

// Pie Chart - Traffic Sources
function initializePieChart() {
    const container = document.getElementById('pie-chart');
    if (!container) return;
    
    const width = container.parentElement.offsetWidth;
    const height = 250;
    const radius = Math.min(width, height) / 2 - 20;
    
    const svg = d3.select(container)
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Data
    const data = [
        { source: 'Direct', value: 35 },
        { source: 'Organic', value: 30 },
        { source: 'Social', value: 20 },
        { source: 'Referral', value: 10 },
        { source: 'Other', value: 5 }
    ];
    
    // Pie generator
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);
    
    const arcHover = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius * 1.1);
    
    // Create arcs
    const arcs = g.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');
    
    arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colors.palette[i])
        .style('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arcHover)
                .style('opacity', 1);
            showTooltip(event, `${d.data.source}: ${d.data.value}%`);
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arc)
                .style('opacity', 0.8);
            hideTooltip();
        });
    
    // Add labels
    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .text(d => d.data.value > 5 ? `${d.data.value}%` : '');
    
    // Add center text
    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-size', '1.5rem')
        .style('font-weight', 'bold')
        .text('Traffic');
    
    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .style('font-size', '0.875rem')
        .style('fill', '#64748b')
        .text('Sources');
}

// Heatmap - Activity Heatmap
function initializeHeatmap() {
    const container = document.getElementById('heatmap-chart');
    if (!container) return;
    
    const width = container.parentElement.offsetWidth - margin.left - margin.right;
    const height = 250;
    
    const svg = d3.select(container)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate heatmap data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({length: 24}, (_, i) => i);
    const data = [];
    
    days.forEach((day, dayIndex) => {
        hours.forEach(hour => {
            data.push({
                day: day,
                hour: hour,
                value: Math.random() * 100
            });
        });
    });
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(hours)
        .range([0, width])
        .padding(0.05);
    
    const yScale = d3.scaleBand()
        .domain(days)
        .range([0, height])
        .padding(0.05);
    
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 100]);
    
    // Create heatmap cells
    g.selectAll('.cell')
        .data(data)
        .enter().append('rect')
        .attr('x', d => xScale(d.hour))
        .attr('y', d => yScale(d.day))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.value))
        .attr('rx', 2)
        .on('mouseover', function(event, d) {
            showTooltip(event, `${d.day} ${d.hour}:00 - Activity: ${Math.round(d.value)}`);
        })
        .on('mouseout', hideTooltip);
    
    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => d % 6 === 0 ? `${d}h` : ''));
    
    g.append('g')
        .call(d3.axisLeft(yScale));
}

// Scatter Plot - Correlation Analysis
function initializeScatterPlot() {
    const container = document.getElementById('scatter-chart');
    if (!container) return;
    
    const width = container.parentElement.offsetWidth - margin.left - margin.right;
    const height = 250;
    
    const svg = d3.select(container)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Generate scatter data
    const data = Array.from({length: 50}, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 5,
        category: Math.floor(Math.random() * 3)
    }));
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    
    const sizeScale = d3.scaleLinear()
        .domain([5, 25])
        .range([3, 15]);
    
    // Create dots
    g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', d => sizeScale(d.size))
        .attr('fill', d => colors.palette[d.category])
        .attr('opacity', 0.6)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            showTooltip(event, `X: ${Math.round(d.x)}, Y: ${Math.round(d.y)}`);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.6);
            hideTooltip();
        });
    
    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    
    g.append('g')
        .call(d3.axisLeft(yScale));
    
    // Add axis labels
    g.append('text')
        .attr('transform', `translate(${width / 2}, ${height + margin.bottom})`)
        .style('text-anchor', 'middle')
        .text('Metric X');
    
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Metric Y');
}

// Update functions
function updateLineChart(period) {
    // Update line chart based on selected period
    console.log(`Updating line chart for ${period}`);
}

function updateAllCharts() {
    // Clear existing charts
    document.querySelectorAll('.d3-chart').forEach(chart => {
        d3.select(chart).selectAll('*').remove();
    });
    
    // Reinitialize all charts
    initializeCharts();
}

// Helper functions
function generateSparklineData(count) {
    const data = [];
    let value = 50;
    
    for (let i = 0; i < count; i++) {
        value += (Math.random() - 0.5) * 10;
        value = Math.max(10, Math.min(90, value));
        data.push({ value });
    }
    
    return data;
}

function generateTimeSeriesData(days) {
    const data = [];
    const now = new Date();
    let value = 50000;
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        value += (Math.random() - 0.5) * 5000;
        value = Math.max(30000, Math.min(80000, value));
        
        data.push({ date, value });
    }
    
    return data;
}

// Tooltip functions
let tooltip = null;

function showTooltip(event, text) {
    if (!tooltip) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('padding', '8px 12px')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('border-radius', '4px')
            .style('font-size', '0.875rem')
            .style('pointer-events', 'none')
            .style('opacity', 0);
    }
    
    tooltip.transition()
        .duration(200)
        .style('opacity', 1);
    
    tooltip.html(text)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
}

function hideTooltip() {
    if (tooltip) {
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
    }
}