// Vertex Shader
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
uniform float time;
uniform float liquidIntensity;

// Noise function for organic movement
float noise(vec3 p) {
    return sin(p.x * 2.0) * sin(p.y * 2.0) * sin(p.z * 2.0);
}

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Create liquid deformation
    vec3 pos = position;
    float frequency = 3.0;
    float amplitude = 0.1 * liquidIntensity;
    
    // Multiple octaves of noise for realistic liquid motion
    float displacement = 0.0;
    displacement += sin(position.x * frequency + time) * amplitude;
    displacement += sin(position.y * frequency * 1.3 + time * 1.2) * amplitude * 0.5;
    displacement += sin(position.z * frequency * 1.7 + time * 0.8) * amplitude * 0.25;
    
    // Apply displacement along normal
    pos += normal * displacement;
    
    // Add surface tension effect
    float tension = smoothstep(0.0, 1.0, sin(time * 2.0) * 0.5 + 0.5);
    pos *= 1.0 + tension * 0.05;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Fragment Shader
varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
uniform float time;
uniform vec3 liquidColor;
uniform float metalness;
uniform float roughness;
uniform vec3 lightPosition;

// Fresnel approximation
float fresnel(vec3 normal, vec3 viewDir, float power) {
    return pow(1.0 - dot(normal, viewDir), power);
}

// Beckmann distribution for specular
float beckmannDistribution(float NdotH, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH2 = NdotH * NdotH;
    float NdotH4 = NdotH2 * NdotH2;
    
    return exp((NdotH2 - 1.0) / (a2 * NdotH2)) / (3.14159 * a2 * NdotH4);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vPosition);
    vec3 lightDir = normalize(lightPosition - vPosition);
    vec3 halfVector = normalize(lightDir + viewDir);
    
    // Base metallic color with chromatic aberration
    vec3 baseColor = liquidColor;
    baseColor.r += sin(vPosition.x * 10.0 + time) * 0.05;
    baseColor.g += sin(vPosition.y * 10.0 + time * 1.1) * 0.05;
    baseColor.b += sin(vPosition.z * 10.0 + time * 1.2) * 0.05;
    
    // Metallic reflection
    vec3 reflection = reflect(-viewDir, normal);
    float NdotL = max(dot(normal, lightDir), 0.0);
    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotH = max(dot(normal, halfVector), 0.0);
    float VdotH = max(dot(viewDir, halfVector), 0.0);
    
    // Cook-Torrance BRDF
    float D = beckmannDistribution(NdotH, roughness);
    float F = fresnel(halfVector, viewDir, 5.0);
    float G = min(1.0, min(2.0 * NdotH * NdotV / VdotH, 2.0 * NdotH * NdotL / VdotH));
    
    float specular = D * F * G / (4.0 * NdotL * NdotV + 0.001);
    
    // Diffuse component
    vec3 diffuse = baseColor * (1.0 - metalness) * NdotL;
    
    // Specular component
    vec3 specularColor = mix(vec3(0.04), baseColor, metalness) * specular * NdotL;
    
    // Ambient
    vec3 ambient = baseColor * 0.1;
    
    // Rim lighting
    float rim = fresnel(normal, viewDir, 2.0);
    vec3 rimColor = vec3(1.0) * rim * 0.3;
    
    // Final color
    vec3 finalColor = ambient + diffuse + specularColor + rimColor;
    
    // Tone mapping
    finalColor = finalColor / (finalColor + vec3(1.0));
    finalColor = pow(finalColor, vec3(1.0/2.2));
    
    gl_FragColor = vec4(finalColor, 1.0);
}