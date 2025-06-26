// Three.js Liquid Metal Background
let scene, camera, renderer;
let liquidMesh;
let time = 0;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('webgl-background').appendChild(renderer.domElement);

    // Create liquid metal geometry
    const geometry = new THREE.IcosahedronGeometry(2, 8);
    
    // Liquid metal shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            metalness: { value: 0.9 },
            roughness: { value: 0.1 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float time;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                
                // Add wave distortion
                vec3 pos = position;
                float wave = sin(position.x * 2.0 + time) * 0.1;
                wave += sin(position.y * 3.0 + time * 1.5) * 0.05;
                wave += sin(position.z * 4.0 + time * 2.0) * 0.03;
                
                pos += normal * wave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float time;
            uniform float metalness;
            uniform float roughness;
            
            void main() {
                // Calculate view direction
                vec3 viewDir = normalize(cameraPosition - vPosition);
                
                // Metallic reflection
                vec3 reflection = reflect(-viewDir, vNormal);
                
                // Base metallic color
                vec3 metalColor = vec3(0.75, 0.75, 0.75);
                
                // Add chromatic aberration
                float r = metalColor.r + sin(reflection.x * 10.0 + time) * 0.1;
                float g = metalColor.g + sin(reflection.y * 10.0 + time * 1.1) * 0.1;
                float b = metalColor.b + sin(reflection.z * 10.0 + time * 1.2) * 0.1;
                
                vec3 color = vec3(r, g, b);
                
                // Fresnel effect
                float fresnel = pow(1.0 - dot(vNormal, viewDir), 2.0);
                color = mix(color, vec3(1.0), fresnel * 0.5);
                
                // Add specular highlight
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float spec = pow(max(dot(reflection, lightDir), 0.0), 32.0);
                color += vec3(1.0) * spec * 0.5;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        wireframe: false,
        side: THREE.DoubleSide
    });

    liquidMesh = new THREE.Mesh(geometry, material);
    scene.add(liquidMesh);

    // Add multiple liquid spheres
    for (let i = 0; i < 5; i++) {
        const sphereGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 32, 32);
        const sphereMesh = new THREE.Mesh(sphereGeometry, material);
        sphereMesh.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 4
        );
        sphereMesh.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
        };
        scene.add(sphereMesh);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    time += 0.01;
    
    // Update shader uniforms
    liquidMesh.material.uniforms.time.value = time;
    
    // Rotate main mesh
    liquidMesh.rotation.x += 0.001;
    liquidMesh.rotation.y += 0.002;
    
    // Animate spheres
    scene.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.add(child.userData.velocity);
            child.rotation.x += 0.01;
            child.rotation.y += 0.01;
            
            // Bounce off boundaries
            if (Math.abs(child.position.x) > 5) child.userData.velocity.x *= -1;
            if (Math.abs(child.position.y) > 5) child.userData.velocity.y *= -1;
            if (Math.abs(child.position.z) > 3) child.userData.velocity.z *= -1;
        }
    });
    
    renderer.render(scene, camera);
}

// Initialize on load
if (typeof THREE !== 'undefined') {
    init();
    animate();
}