// Quantum Particle System
class QuantumParticleSystem {
    constructor() {
        this.canvas = document.getElementById('quantum-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true, 
            alpha: true 
        });
        
        this.particles = [];
        this.particleCount = 1000;
        this.connections = [];
        this.mousePosition = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Camera position
        this.camera.position.z = 50;
        
        // Create particles
        this.createParticles();
        
        // Create connections
        this.createConnections();
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x00ffff, 0.5);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x00ffff, 1);
        pointLight.position.set(0, 0, 30);
        this.scene.add(pointLight);
        
        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Start animation
        this.animate();
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;
            
            // Color (cyan to purple gradient)
            const t = Math.random();
            colors[i3] = t; // R
            colors[i3 + 1] = 1 - t * 0.5; // G
            colors[i3 + 2] = 1; // B
            
            // Size
            sizes[i] = Math.random() * 3 + 1;
            
            // Store particle data
            this.particles.push({
                position: new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                originalSize: sizes[i],
                phase: Math.random() * Math.PI * 2
            });
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Shader material for particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float pulse = sin(time + length(position) * 0.1) * 0.5 + 0.5;
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (0.8 + pulse * 0.2);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5));
                    if (r > 0.5) discard;
                    
                    float intensity = 1.0 - smoothstep(0.0, 0.5, r);
                    vec3 color = vColor * intensity;
                    
                    gl_FragColor = vec4(color, intensity * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            vertexColors: true
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }
    
    createConnections() {
        const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        
        // Create connection lines
        for (let i = 0; i < 100; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, material);
            line.visible = false;
            this.connections.push(line);
            this.scene.add(line);
        }
    }
    
    updateParticles(time) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;
        
        let connectionIndex = 0;
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * 3;
            
            // Update position with velocity
            particle.position.add(particle.velocity);
            
            // Boundary check
            ['x', 'y', 'z'].forEach((axis, idx) => {
                const limit = idx === 2 ? 25 : 50;
                if (Math.abs(particle.position[axis]) > limit) {
                    particle.velocity[axis] *= -1;
                }
            });
            
            // Quantum fluctuation
            particle.position.x += Math.sin(time + particle.phase) * 0.01;
            particle.position.y += Math.cos(time + particle.phase * 1.5) * 0.01;
            
            // Update buffer
            positions[i3] = particle.position.x;
            positions[i3 + 1] = particle.position.y;
            positions[i3 + 2] = particle.position.z;
            
            // Pulse size
            sizes[i] = particle.originalSize * (1 + Math.sin(time * 2 + particle.phase) * 0.2);
            
            // Check connections with nearby particles
            for (let j = i + 1; j < this.particles.length; j++) {
                const distance = particle.position.distanceTo(this.particles[j].position);
                
                if (distance < 10 && connectionIndex < this.connections.length) {
                    const line = this.connections[connectionIndex];
                    const linePositions = line.geometry.attributes.position.array;
                    
                    linePositions[0] = particle.position.x;
                    linePositions[1] = particle.position.y;
                    linePositions[2] = particle.position.z;
                    linePositions[3] = this.particles[j].position.x;
                    linePositions[4] = this.particles[j].position.y;
                    linePositions[5] = this.particles[j].position.z;
                    
                    line.geometry.attributes.position.needsUpdate = true;
                    line.visible = true;
                    line.material.opacity = (1 - distance / 10) * 0.3;
                    
                    connectionIndex++;
                }
            }
        }
        
        // Hide unused connections
        for (let i = connectionIndex; i < this.connections.length; i++) {
            this.connections[i].visible = false;
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.size.needsUpdate = true;
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Influence particles near mouse
        this.raycaster.setFromCamera(this.mousePosition, this.camera);
        
        const mouseWorld = new THREE.Vector3();
        mouseWorld.set(this.mousePosition.x * 50, this.mousePosition.y * 50, 0);
        
        this.particles.forEach(particle => {
            const distance = particle.position.distanceTo(mouseWorld);
            if (distance < 20) {
                const force = 1 - distance / 20;
                const direction = particle.position.clone().sub(mouseWorld).normalize();
                particle.velocity.add(direction.multiplyScalar(force * 0.1));
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Update shader uniforms
        this.particleSystem.material.uniforms.time.value = time;
        
        // Update particles
        this.updateParticles(time);
        
        // Rotate particle system
        this.particleSystem.rotation.y += 0.0005;
        this.particleSystem.rotation.x += 0.0002;
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumParticleSystem();
    
    // Initialize network visualization
    initializeNetworkVisualization();
});

function initializeNetworkVisualization() {
    const svg = document.querySelector('.network-svg');
    if (!svg) return;
    
    const nodes = [];
    const links = [];
    const nodeCount = 24;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 100 + Math.random() * 50;
        const x = 200 + Math.cos(angle) * radius;
        const y = 150 + Math.sin(angle) * radius;
        
        nodes.push({ id: i, x, y, vx: 0, vy: 0 });
        
        // Create node element
        const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        node.setAttribute('cx', x);
        node.setAttribute('cy', y);
        node.setAttribute('r', 3);
        node.setAttribute('fill', '#00ffff');
        node.setAttribute('filter', 'url(#glow)');
        node.classList.add('network-node');
        node.dataset.id = i;
        svg.appendChild(node);
    }
    
    // Create links
    for (let i = 0; i < nodeCount; i++) {
        const connections = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < connections; j++) {
            const target = Math.floor(Math.random() * nodeCount);
            if (target !== i) {
                links.push({ source: i, target });
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', nodes[i].x);
                line.setAttribute('y1', nodes[i].y);
                line.setAttribute('x2', nodes[target].x);
                line.setAttribute('y2', nodes[target].y);
                line.setAttribute('stroke', '#00ffff');
                line.setAttribute('stroke-opacity', '0.2');
                line.setAttribute('stroke-width', '1');
                line.classList.add('network-link');
                svg.insertBefore(line, svg.firstChild);
            }
        }
    }
    
    // Add glow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    `;
    svg.appendChild(defs);
    
    // Animate network
    function animateNetwork() {
        const nodeElements = svg.querySelectorAll('.network-node');
        const linkElements = svg.querySelectorAll('.network-link');
        
        // Update node positions
        nodes.forEach((node, i) => {
            // Add some random movement
            node.vx += (Math.random() - 0.5) * 0.1;
            node.vy += (Math.random() - 0.5) * 0.1;
            
            // Apply damping
            node.vx *= 0.95;
            node.vy *= 0.95;
            
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Boundary check
            if (node.x < 20 || node.x > 380) node.vx *= -1;
            if (node.y < 20 || node.y > 280) node.vy *= -1;
            
            // Update DOM
            nodeElements[i].setAttribute('cx', node.x);
            nodeElements[i].setAttribute('cy', node.y);
        });
        
        // Update links
        links.forEach((link, i) => {
            if (linkElements[i]) {
                linkElements[i].setAttribute('x1', nodes[link.source].x);
                linkElements[i].setAttribute('y1', nodes[link.source].y);
                linkElements[i].setAttribute('x2', nodes[link.target].x);
                linkElements[i].setAttribute('y2', nodes[link.target].y);
            }
        });
        
        requestAnimationFrame(animateNetwork);
    }
    
    animateNetwork();
}