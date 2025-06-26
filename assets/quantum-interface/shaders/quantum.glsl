// Quantum Particle Vertex Shader
attribute float size;
attribute vec3 customColor;
varying vec3 vColor;
varying float vIntensity;

uniform float time;
uniform float quantumField;

// Quantum wave function
float quantumWave(vec3 pos, float t) {
    float wave = sin(pos.x * 0.1 + t) * cos(pos.y * 0.1 + t * 1.3) * sin(pos.z * 0.1 + t * 0.7);
    return wave * 0.5 + 0.5;
}

// Perlin noise approximation
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = dot(i, vec3(1.0, 57.0, 113.0));
    return mix(mix(mix(sin(n), sin(n + 1.0), f.x),
                   mix(sin(n + 57.0), sin(n + 58.0), f.x), f.y),
               mix(mix(sin(n + 113.0), sin(n + 114.0), f.x),
                   mix(sin(n + 170.0), sin(n + 171.0), f.x), f.y), f.z);
}

void main() {
    vColor = customColor;
    
    // Apply quantum field distortion
    vec3 pos = position;
    float quantum = quantumWave(position, time);
    float n = noise(position * 0.05 + time * 0.1);
    
    // Quantum uncertainty principle - position fluctuation
    pos += normalize(position) * sin(time * 2.0 + length(position) * 0.1) * quantumField * 2.0;
    
    // Wave-particle duality effect
    float duality = sin(time + length(position) * 0.2) * 0.5 + 0.5;
    pos.z += duality * n * 5.0;
    
    // Calculate intensity for fragment shader
    vIntensity = quantum * 0.5 + 0.5;
    
    // Transform position
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Pulsating size based on quantum state
    float pulse = 1.0 + sin(time * 3.0 + length(position) * 0.1) * 0.3;
    gl_PointSize = size * (300.0 / -mvPosition.z) * pulse * (0.5 + quantum * 0.5);
    
    gl_Position = projectionMatrix * mvPosition;
}

// Quantum Particle Fragment Shader
varying vec3 vColor;
varying float vIntensity;

uniform float time;
uniform vec3 quantumColor;

void main() {
    // Distance from center of point
    float r = distance(gl_PointCoord, vec2(0.5));
    
    // Discard pixels outside circle
    if (r > 0.5) discard;
    
    // Quantum glow effect
    float glow = exp(-r * 6.0) * vIntensity;
    
    // Core intensity
    float core = 1.0 - smoothstep(0.0, 0.3, r);
    
    // Outer halo
    float halo = 1.0 - smoothstep(0.3, 0.5, r);
    
    // Combine effects
    float intensity = core + halo * 0.5 + glow;
    
    // Color mixing with quantum field
    vec3 finalColor = mix(vColor, quantumColor, vIntensity * 0.5);
    
    // Add chromatic aberration at edges
    if (r > 0.3) {
        finalColor.r += (r - 0.3) * 0.5;
        finalColor.b += (r - 0.3) * 0.3;
    }
    
    // Output with additive blending
    gl_FragColor = vec4(finalColor * intensity, intensity * 0.8);
}

// Quantum Field Vertex Shader
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    
    // Add wave distortion to mesh
    vec3 pos = position;
    float wave = sin(position.x * 0.5 + time) * cos(position.y * 0.5 + time * 1.2) * 0.5;
    pos.z += wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Quantum Field Fragment Shader
uniform float time;
uniform vec2 resolution;
uniform vec3 fieldColor1;
uniform vec3 fieldColor2;
varying vec2 vUv;
varying vec3 vPosition;

// Fractal noise for quantum field visualization
float fractalNoise(vec2 p) {
    float f = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    
    for (int i = 0; i < 5; i++) {
        f += amplitude * sin(p.x * frequency + time * 0.5) * cos(p.y * frequency + time * 0.3);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return f;
}

// Quantum interference pattern
float interference(vec2 p, float t) {
    float wave1 = sin(length(p - vec2(0.3, 0.5)) * 20.0 - t * 2.0);
    float wave2 = sin(length(p - vec2(0.7, 0.5)) * 20.0 - t * 2.0);
    return (wave1 + wave2) * 0.5;
}

void main() {
    vec2 p = vUv;
    
    // Create quantum field pattern
    float n1 = fractalNoise(p * 3.0);
    float n2 = fractalNoise(p * 5.0 + 100.0);
    float field = mix(n1, n2, 0.5);
    
    // Add interference pattern
    float inter = interference(p, time);
    field += inter * 0.2;
    
    // Create energy flow lines
    float flow = sin(p.x * 10.0 + time) * sin(p.y * 10.0 - time);
    field += flow * 0.1;
    
    // Normalize and enhance contrast
    field = smoothstep(-1.0, 1.0, field);
    
    // Mix colors based on field intensity
    vec3 color = mix(fieldColor1, fieldColor2, field);
    
    // Add glow at high intensity areas
    if (field > 0.7) {
        color += (field - 0.7) * 3.0;
    }
    
    // Distance fade from center
    float dist = length(p - vec2(0.5));
    float fade = 1.0 - smoothstep(0.3, 0.5, dist);
    
    gl_FragColor = vec4(color, field * fade * 0.8);
}