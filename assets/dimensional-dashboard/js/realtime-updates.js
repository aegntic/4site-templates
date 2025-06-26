// Real-time Updates for Dimensional Dashboard

let realtimeInterval;
let activityInterval;
let realtimeChart;
let realtimeData = [];
const maxDataPoints = 50;

// Start real-time updates
function startRealtimeUpdates() {
    initializeRealtimeChart();
    startRealtimeDataStream();
    startActivityFeed();
}

// Initialize real-time chart
function initializeRealtimeChart() {
    const container = document.getElementById('realtime-chart');
    if (!container) return;
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const margin = { top: 10, right: 10, bottom: 30, left: 40 };
    
    // Clear existing chart
    d3.select(container).selectAll('*').remove();
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Initialize scales
    const xScale = d3.scaleLinear()
        .domain([0, maxDataPoints - 1])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([innerHeight, 0]);
    
    // Create line generator
    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    // Add gradient
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'realtime-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', innerHeight);
    
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#6366f1')
        .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#6366f1')
        .attr('stop-opacity', 0.1);
    
    // Add axes
    const xAxis = g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5));
    
    const yAxis = g.append('g')
        .call(d3.axisLeft(yScale).ticks(5));
    
    // Add grid lines
    g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
            .ticks(5)
            .tickSize(-innerHeight)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    
    g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    
    // Add area
    const area = d3.area()
        .x((d, i) => xScale(i))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    const areaPath = g.append('path')
        .attr('fill', 'url(#realtime-gradient)')
        .attr('d', area([]));
    
    // Add line
    const linePath = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2)
        .attr('d', line([]));
    
    // Add glow effect
    const glowPath = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 4)
        .attr('opacity', 0.5)
        .attr('filter', 'blur(4px)')
        .attr('d', line([]));
    
    // Store chart elements for updates
    realtimeChart = {
        line: linePath,
        area: areaPath,
        glow: glowPath,
        xScale,
        yScale,
        lineGenerator: line,
        areaGenerator: area
    };
}

// Start real-time data stream
function startRealtimeDataStream() {
    // Initialize with some data
    for (let i = 0; i < maxDataPoints; i++) {
        realtimeData.push({
            value: Math.random() * 50 + 25,
            timestamp: Date.now() - (maxDataPoints - i) * 1000
        });
    }
    
    // Update chart every second
    realtimeInterval = setInterval(() => {
        // Generate new data point
        const lastValue = realtimeData[realtimeData.length - 1].value;
        const change = (Math.random() - 0.5) * 10;
        const newValue = Math.max(0, Math.min(100, lastValue + change));
        
        realtimeData.push({
            value: newValue,
            timestamp: Date.now()
        });
        
        // Keep only last maxDataPoints
        if (realtimeData.length > maxDataPoints) {
            realtimeData.shift();
        }
        
        // Update chart
        updateRealtimeChart();
        
        // Update stats
        updateRealtimeStats(newValue);
    }, 1000);
}

// Update real-time chart
function updateRealtimeChart() {
    if (!realtimeChart) return;
    
    const { line, area, glow, lineGenerator, areaGenerator } = realtimeChart;
    
    // Update paths with smooth transition
    line.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('d', lineGenerator(realtimeData));
    
    area.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('d', areaGenerator(realtimeData));
    
    glow.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('d', lineGenerator(realtimeData));
}

// Update real-time stats
function updateRealtimeStats(currentValue) {
    // Update current users (simulate based on value)
    const currentUsers = Math.floor(currentValue * 10 + Math.random() * 50);
    document.getElementById('current-users').textContent = currentUsers.toLocaleString();
    
    // Update requests per second
    const requestsPerSec = Math.floor(currentValue / 10 + Math.random() * 5);
    document.getElementById('requests-sec').textContent = requestsPerSec.toLocaleString();
    
    // Update average response time
    const avgResponse = Math.floor(50 + Math.random() * 100);
    document.getElementById('avg-response').textContent = `${avgResponse}ms`;
}

// Start activity feed
function startActivityFeed() {
    const activities = [
        { type: 'success', message: 'New user registration completed' },
        { type: 'info', message: 'System backup initiated' },
        { type: 'warning', message: 'High memory usage detected' },
        { type: 'success', message: 'Order #12345 processed successfully' },
        { type: 'info', message: 'Report generated for Q4 2023' },
        { type: 'success', message: 'Payment received from customer' },
        { type: 'warning', message: 'API rate limit approaching' },
        { type: 'info', message: 'Database optimization completed' },
        { type: 'success', message: 'Email campaign sent to 5,000 users' },
        { type: 'info', message: 'Server maintenance scheduled' }
    ];
    
    const feedContainer = document.getElementById('activity-feed');
    
    // Add initial activities
    for (let i = 0; i < 5; i++) {
        addActivityItem(activities[Math.floor(Math.random() * activities.length)]);
    }
    
    // Add new activity every 3-7 seconds
    activityInterval = setInterval(() => {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        addActivityItem(activity);
    }, Math.random() * 4000 + 3000);
}

// Add activity item to feed
function addActivityItem(activity) {
    const feedContainer = document.getElementById('activity-feed');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    
    const time = new Date().toLocaleTimeString();
    
    item.innerHTML = `
        <div class="activity-time">${time}</div>
        <div class="activity-message">
            ${activity.message}
            <span class="activity-type ${activity.type}">${activity.type}</span>
        </div>
    `;
    
    // Add to top of feed
    feedContainer.insertBefore(item, feedContainer.firstChild);
    
    // Animate in
    setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove old items if too many
    const items = feedContainer.querySelectorAll('.activity-item');
    if (items.length > 10) {
        const lastItem = items[items.length - 1];
        lastItem.style.opacity = '0';
        lastItem.style.transform = 'translateY(20px)';
        setTimeout(() => lastItem.remove(), 300);
    }
}

// WebSocket simulation for real-time data
function simulateWebSocket() {
    // In a real application, this would be a WebSocket connection
    // For demo purposes, we're simulating with setInterval
    
    const wsEvents = [
        { event: 'user_joined', data: { userId: Math.floor(Math.random() * 10000) } },
        { event: 'purchase_completed', data: { amount: Math.floor(Math.random() * 1000) } },
        { event: 'server_status', data: { cpu: Math.random() * 100, memory: Math.random() * 100 } }
    ];
    
    setInterval(() => {
        const event = wsEvents[Math.floor(Math.random() * wsEvents.length)];
        handleWebSocketMessage(event);
    }, 5000);
}

// Handle WebSocket messages
function handleWebSocketMessage(message) {
    console.log('WebSocket message:', message);
    
    switch (message.event) {
        case 'user_joined':
            // Update user count
            const currentUsers = document.getElementById('current-users');
            const count = parseInt(currentUsers.textContent.replace(/,/g, '')) + 1;
            currentUsers.textContent = count.toLocaleString();
            break;
            
        case 'purchase_completed':
            // Flash revenue value
            const revenueValue = document.getElementById('revenue-value');
            revenueValue.style.color = '#10b981';
            setTimeout(() => {
                revenueValue.style.color = '';
            }, 1000);
            break;
            
        case 'server_status':
            // Update performance metrics
            if (message.data.cpu > 80) {
                addActivityItem({
                    type: 'warning',
                    message: `High CPU usage: ${Math.floor(message.data.cpu)}%`
                });
            }
            break;
    }
}

// Clean up intervals on page unload
window.addEventListener('beforeunload', () => {
    if (realtimeInterval) clearInterval(realtimeInterval);
    if (activityInterval) clearInterval(activityInterval);
});

// Start WebSocket simulation
simulateWebSocket();