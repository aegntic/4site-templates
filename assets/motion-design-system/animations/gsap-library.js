// GSAP Animation Library
// Advanced animation presets and utilities

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, DrawSVGPlugin);

// Animation Presets Library
const AnimationPresets = {
    // Entrance Animations
    entrance: {
        fadeInUp: {
            from: { opacity: 0, y: 50 },
            to: { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        },
        fadeInDown: {
            from: { opacity: 0, y: -50 },
            to: { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        },
        fadeInLeft: {
            from: { opacity: 0, x: -50 },
            to: { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
        },
        fadeInRight: {
            from: { opacity: 0, x: 50 },
            to: { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
        },
        zoomIn: {
            from: { opacity: 0, scale: 0.5 },
            to: { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)" }
        },
        rotateIn: {
            from: { opacity: 0, rotation: -180 },
            to: { opacity: 1, rotation: 0, duration: 1, ease: "power3.out" }
        },
        flipInX: {
            from: { opacity: 0, rotationX: -90, transformPerspective: 1000 },
            to: { opacity: 1, rotationX: 0, duration: 1, ease: "power3.out" }
        },
        flipInY: {
            from: { opacity: 0, rotationY: -90, transformPerspective: 1000 },
            to: { opacity: 1, rotationY: 0, duration: 1, ease: "power3.out" }
        },
        bounceIn: {
            from: { opacity: 0, scale: 0.3 },
            to: { 
                opacity: 1, 
                scale: 1, 
                duration: 1.2,
                ease: "elastic.out(1, 0.5)"
            }
        }
    },
    
    // Exit Animations
    exit: {
        fadeOutUp: {
            to: { opacity: 0, y: -50, duration: 1, ease: "power3.in" }
        },
        fadeOutDown: {
            to: { opacity: 0, y: 50, duration: 1, ease: "power3.in" }
        },
        fadeOutLeft: {
            to: { opacity: 0, x: -50, duration: 1, ease: "power3.in" }
        },
        fadeOutRight: {
            to: { opacity: 0, x: 50, duration: 1, ease: "power3.in" }
        },
        zoomOut: {
            to: { opacity: 0, scale: 0.5, duration: 1, ease: "power3.in" }
        },
        rotateOut: {
            to: { opacity: 0, rotation: 180, duration: 1, ease: "power3.in" }
        },
        flipOutX: {
            to: { opacity: 0, rotationX: 90, transformPerspective: 1000, duration: 1, ease: "power3.in" }
        },
        flipOutY: {
            to: { opacity: 0, rotationY: 90, transformPerspective: 1000, duration: 1, ease: "power3.in" }
        }
    },
    
    // Emphasis Animations
    emphasis: {
        pulse: {
            to: { scale: 1.05, duration: 0.5, ease: "power2.inOut", yoyo: true, repeat: 1 }
        },
        shake: {
            to: { x: "+=10", duration: 0.1, ease: "power2.inOut", yoyo: true, repeat: 5 }
        },
        wobble: {
            to: { 
                rotation: "+=15", 
                duration: 0.2, 
                ease: "power2.inOut", 
                yoyo: true, 
                repeat: 3,
                transformOrigin: "center bottom"
            }
        },
        rubberBand: {
            timeline: [
                { scaleX: 1.25, scaleY: 0.75, duration: 0.3 },
                { scaleX: 0.75, scaleY: 1.25, duration: 0.1 },
                { scaleX: 1.15, scaleY: 0.85, duration: 0.1 },
                { scaleX: 0.95, scaleY: 1.05, duration: 0.1 },
                { scaleX: 1, scaleY: 1, duration: 0.2 }
            ]
        },
        heartbeat: {
            timeline: [
                { scale: 1.2, duration: 0.2, ease: "power2.out" },
                { scale: 1, duration: 0.1 },
                { scale: 1.15, duration: 0.2, ease: "power2.out" },
                { scale: 1, duration: 0.3 }
            ]
        }
    },
    
    // Transition Animations
    transition: {
        morphSVG: function(fromPath, toPath, duration = 2) {
            return {
                attr: { d: toPath },
                duration: duration,
                ease: "power2.inOut"
            };
        },
        colorShift: function(fromColor, toColor, duration = 1) {
            return {
                backgroundColor: toColor,
                color: toColor,
                duration: duration,
                ease: "power2.inOut"
            };
        },
        typewriter: function(text, duration = 2) {
            return {
                text: text,
                duration: duration,
                ease: "none",
                cursor: true
            };
        }
    }
};

// Utility Functions
const AnimationUtils = {
    // Stagger animations for multiple elements
    staggerAnimation: function(elements, animation, staggerTime = 0.1) {
        return gsap.fromTo(elements, animation.from || {}, {
            ...animation.to,
            stagger: staggerTime
        });
    },
    
    // Create a timeline with multiple animations
    createTimeline: function(animations, options = {}) {
        const tl = gsap.timeline(options);
        animations.forEach(anim => {
            if (anim.label) {
                tl.to(anim.target, anim.animation, anim.label);
            } else {
                tl.to(anim.target, anim.animation);
            }
        });
        return tl;
    },
    
    // Scroll-triggered animations
    scrollAnimation: function(element, animation, triggerOptions = {}) {
        const defaultTrigger = {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        };
        
        return gsap.fromTo(element, animation.from || {}, {
            ...animation.to,
            scrollTrigger: { ...defaultTrigger, ...triggerOptions }
        });
    },
    
    // Mouse follow animation
    mouseFollow: function(element, intensity = 0.5) {
        let mouse = { x: 0, y: 0 };
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * intensity;
            mouse.y = (e.clientY / window.innerHeight - 0.5) * intensity;
            
            gsap.to(element, {
                x: mouse.x * 100,
                y: mouse.y * 100,
                duration: 1,
                ease: "power2.out"
            });
        });
    },
    
    // Parallax effect
    parallax: function(elements, speed = 0.5) {
        elements.forEach((element, index) => {
            const elementSpeed = speed * (index + 1);
            
            gsap.to(element, {
                yPercent: -100 * elementSpeed,
                ease: "none",
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    },
    
    // Text scramble effect
    scrambleText: function(element, finalText, duration = 2) {
        const chars = "!<>-_\\/[]{}—=+*^?#________";
        let iteration = 0;
        
        const interval = setInterval(() => {
            element.innerText = finalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return finalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
            
            if (iteration >= finalText.length) {
                clearInterval(interval);
            }
            
            iteration += 1 / (duration * 10);
        }, 30);
    },
    
    // Magnetic hover effect
    magneticHover: function(element, strength = 20) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(element, {
                x: x / rect.width * strength,
                y: y / rect.height * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }
};

// Complex Animation Examples
const ComplexAnimations = {
    // Liquid morph effect
    liquidMorph: function(element) {
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(element, {
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            duration: 2,
            ease: "power1.inOut"
        })
        .to(element, {
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
            duration: 2,
            ease: "power1.inOut"
        })
        .to(element, {
            borderRadius: "50%",
            duration: 2,
            ease: "power1.inOut"
        });
        
        return tl;
    },
    
    // 3D card flip
    cardFlip3D: function(card, front, back) {
        const tl = gsap.timeline({ paused: true });
        
        gsap.set(back, { rotationY: -180 });
        gsap.set([front, back], { transformPerspective: 1000, backfaceVisibility: "hidden" });
        
        tl.to(front, { rotationY: 180, duration: 0.6, ease: "power2.inOut" })
          .to(back, { rotationY: 0, duration: 0.6, ease: "power2.inOut" }, 0);
        
        card.addEventListener('click', () => {
            tl.reversed() ? tl.play() : tl.reverse();
        });
        
        return tl;
    },
    
    // Particle explosion
    particleExplosion: function(container, particleCount = 50) {
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            container.appendChild(particle);
            
            gsap.set(particle, {
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                position: 'absolute',
                borderRadius: '50%'
            });
            
            gsap.fromTo(particle, {
                x: 0,
                y: 0,
                opacity: 1
            }, {
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                opacity: 0,
                duration: Math.random() * 2 + 1,
                ease: "power2.out",
                onComplete: () => particle.remove()
            });
        }
    }
};

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize data-animation attributes
    document.querySelectorAll('[data-animation]').forEach(element => {
        const animationType = element.getAttribute('data-animation');
        const category = element.getAttribute('data-category') || 'entrance';
        
        if (AnimationPresets[category] && AnimationPresets[category][animationType]) {
            const animation = AnimationPresets[category][animationType];
            
            if (element.hasAttribute('data-scroll')) {
                AnimationUtils.scrollAnimation(element, animation);
            } else {
                gsap.fromTo(element, animation.from || {}, animation.to);
            }
        }
    });
    
    // Initialize magnetic hover on buttons
    document.querySelectorAll('.btn').forEach(button => {
        AnimationUtils.magneticHover(button, 10);
    });
});

// Export for use in other scripts
window.AnimationPresets = AnimationPresets;
window.AnimationUtils = AnimationUtils;
window.ComplexAnimations = ComplexAnimations;