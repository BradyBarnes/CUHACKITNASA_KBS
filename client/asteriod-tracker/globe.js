// 3D Earth Globe using Three.js
class EarthGlobe {
    constructor() {
        this.container = document.getElementById('globe-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.nightEarth = null;
        this.animationId = null;
        this.rotationSpeed = 0.005;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('Globe container not found');
            return;
        }
        
        // Set up scene
        this.scene = new THREE.Scene();
        
        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 2;
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Create Earth
        this.createEarth();
        
        // Add lighting
        this.setupLighting();
        
        // Start animation
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createEarth() {
        // Create Earth geometry and material
        const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Load multiple textures for a realistic Earth
        const textureLoader = new THREE.TextureLoader();
        
        // Main Earth surface texture (day side)
        const earthTexture = textureLoader.load(
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
        );
        
        // Night side texture (city lights)
        const nightTexture = textureLoader.load(
            'https://threejs.org/examples/textures/planets/earth_lights_2048.jpg'
        );
        
        // Normal map for surface detail
        const normalTexture = textureLoader.load(
            'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'
        );
        
        // Configure textures
        [earthTexture, nightTexture, normalTexture].forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.flipY = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
        });
        
        // Create realistic Earth material
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: earthTexture,
            normalMap: normalTexture,
            transparent: false,
            side: THREE.DoubleSide,
            shininess: 100,
            specular: new THREE.Color(0x111111),
            normalScale: new THREE.Vector2(0.5, 0.5)
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        // Fix Earth orientation by rotating it 180 degrees
        this.earth.rotation.x = Math.PI;
        this.scene.add(this.earth);
        
        // Create night side mesh
        const nightMaterial = new THREE.MeshBasicMaterial({
            map: nightTexture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        this.nightEarth = new THREE.Mesh(earthGeometry, nightMaterial);
        this.nightEarth.rotation.x = Math.PI;
        this.scene.add(this.nightEarth);
        
        // Add atmosphere glow
        this.addAtmosphere();
    }
    
    
    addAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
        
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }
    
    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Primary directional light (sun) - stronger for better surface detail
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(10, 5, 5);
        directionalLight.castShadow = false;
        this.scene.add(directionalLight);
        
        // Secondary directional light for fill lighting
        const directionalLight2 = new THREE.DirectionalLight(0x87CEEB, 0.3);
        directionalLight2.position.set(-5, 3, -5);
        this.scene.add(directionalLight2);
        
        // Point light for rim lighting
        const pointLight = new THREE.PointLight(0x87CEEB, 0.5, 15);
        pointLight.position.set(-3, 2, 3);
        this.scene.add(pointLight);
        
        // Hemisphere light for natural sky/ground lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x2C3E50, 0.8);
        this.scene.add(hemisphereLight);
        
        // Add a subtle rim light for atmospheric effect
        const rimLight = new THREE.DirectionalLight(0x87CEEB, 0.2);
        rimLight.position.set(0, 0, -10);
        this.scene.add(rimLight);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Rotate Earth smoothly
        if (this.earth) {
            this.earth.rotation.y += this.rotationSpeed;
        }
        
        // Rotate night Earth in sync
        if (this.nightEarth) {
            this.nightEarth.rotation.y += this.rotationSpeed;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        window.removeEventListener('resize', this.onWindowResize);
    }
}

// Initialize globe when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the home section to be visible before initializing
    const homeSection = document.getElementById('home-section');
    if (homeSection && homeSection.classList.contains('active')) {
        try {
            if (!window.earthGlobe) {
                window.earthGlobe = new EarthGlobe();
            }
        } catch (error) {
            console.error('Failed to initialize Earth Globe:', error);
        }
    }
});

// Re-initialize globe when home section becomes active
document.addEventListener('click', function(e) {
    if (e.target.dataset.page === 'home') {
        setTimeout(() => {
            try {
                if (window.earthGlobe) {
                    window.earthGlobe.destroy();
                    window.earthGlobe = null;
                }
                window.earthGlobe = new EarthGlobe();
            } catch (error) {
                console.error('Failed to re-initialize Earth Globe:', error);
            }
        }, 100);
    }
});

// Handle page transitions - but only when actually switching TO home
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const homeSection = document.getElementById('home-section');
            const wasActive = mutation.oldValue && mutation.oldValue.includes('active');
            const isActive = homeSection && homeSection.classList.contains('active');
            
            // Only reinitialize if we're switching TO the home section
            if (!wasActive && isActive) {
                setTimeout(() => {
                    try {
                        if (window.earthGlobe) {
                            window.earthGlobe.destroy();
                            window.earthGlobe = null;
                        }
                        window.earthGlobe = new EarthGlobe();
                    } catch (error) {
                        console.error('Failed to re-initialize Earth Globe on transition:', error);
                    }
                }, 100);
            }
        }
    });
});

// Start observing
const homeSection = document.getElementById('home-section');
if (homeSection) {
    observer.observe(homeSection, { 
        attributes: true, 
        attributeOldValue: true 
    });
}

// ==================== ASTEROID FUN FACTS SYSTEM ====================
const asteroidFacts = [
    "Some asteroids are so loosely packed they're held together by gravity alone—like cosmic \"rubble piles.\"",
    "The Chelyabinsk meteor exploded in 2013 with the force of 30 Hiroshima bombs, and it was only about 20 meters wide.",
    "Asteroids can have their own moons—a moon orbiting a mini-planet!",
    "NASA tracks over 30,000 Near-Earth Objects (NEOs)—and finds more every week.",
    "An asteroid the size of a school bus could flatten a city if it hit Earth.",
    "The largest asteroid in the solar system is Ceres, which is so big it's considered a dwarf planet.",
    "Earth is hit by over 100 tons of space dust every single day—mostly too small to notice.",
    "The dinosaurs went extinct because of an asteroid about the size of Mount Everest.",
    "A 140-meter asteroid would hit Earth with more energy than 1,000 nuclear bombs.",
    "The DART mission was the first time humanity intentionally moved a celestial object.",
    "Asteroids orbit the Sun just like planets, but many have highly elliptical orbits that cross Earth's path.",
    "In space, a tiny push can make a huge difference over time—that's why early deflection is key!",
    "Some scientists want to paint asteroids white so sunlight nudges them off course (seriously—this is called the Yarkovsky Effect!).",
    "Most NEOs are discovered by robotic telescopes scanning the sky while we sleep.",
    "Asteroids have hit Earth many times—you're likely standing on top of ancient impact debris right now.",
    "An asteroid hit is the only natural disaster we can prevent—but only if we act early enough.",
    "A gravity tractor moves an asteroid just by hovering near it—the spacecraft's mass pulls it off course.",
    "The asteroid belt isn't crowded—it's mostly empty space. You could fly a spaceship through it without hitting anything!",
    "Some asteroids are metal-rich, possibly containing more platinum and nickel than all Earth's mines combined.",
    "A tsunami caused by an ocean impact could flood coastlines for hundreds of kilometers.",
    "The difference between a meteoroid, meteor, and meteorite? In space = meteoroid, Burning in the atmosphere = meteor, On the ground = meteorite",
    "You can simulate asteroid impacts online using real science—and soon, on this website!",
    "Asteroids shaped like potatoes are common—gravity isn't always strong enough to make them round.",
    "Some asteroids spin so fast they would fly apart if they weren't tightly held together.",
    "You're more likely to be hit by an asteroid than to win the lottery—but don't worry, the odds are still really low."
];

class AsteroidFunFacts {
    constructor() {
        this.modal = document.getElementById('fun-fact-modal');
        this.factText = document.getElementById('fun-fact-text');
        this.closeBtn = document.querySelector('.close-modal');
        
        this.init();
    }
    
    init() {
        // Add direct event listeners to each asteroid
        this.addAsteroidListeners();
        
        // Close modal when clicking the X
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal when clicking outside of it
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });
    }
    
    addAsteroidListeners() {
        // Remove any existing listeners first
        const existingAsteroids = document.querySelectorAll('.asteroid');
        existingAsteroids.forEach(asteroid => {
            asteroid.removeEventListener('click', this.handleAsteroidClick);
        });
        
        // Add new listeners
        const asteroids = document.querySelectorAll('.asteroid');
        asteroids.forEach(asteroid => {
            asteroid.addEventListener('click', this.handleAsteroidClick.bind(this));
        });
    }
    
    handleAsteroidClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.showRandomFact(e);
    }
    
    showRandomFact(event) {
        event.preventDefault();
        
        // Get a random fact
        const randomIndex = Math.floor(Math.random() * asteroidFacts.length);
        const randomFact = asteroidFacts[randomIndex];
        
        // Display the fact in the modal
        if (this.factText) {
            this.factText.textContent = randomFact;
        }
        
        // Show the modal
        if (this.modal) {
            this.modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        
        // Add a fun visual effect to the clicked asteroid
        const asteroid = event.target;
        asteroid.style.animation = 'none';
        setTimeout(() => {
            asteroid.style.animation = 'asteroidFloat 3s ease-in-out infinite';
        }, 100);
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }
}

// Initialize the fun facts system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize or reinitialize the fun facts system
    if (window.asteroidFunFacts) {
        window.asteroidFunFacts.addAsteroidListeners();
    } else {
        window.asteroidFunFacts = new AsteroidFunFacts();
    }
});

// Reinitialize asteroid listeners when globe is recreated
const originalGlobeInit = EarthGlobe.prototype.init;
EarthGlobe.prototype.init = function() {
    originalGlobeInit.call(this);
    // Re-add asteroid listeners after globe initialization
    if (window.asteroidFunFacts) {
        setTimeout(() => {
            window.asteroidFunFacts.addAsteroidListeners();
        }, 100);
    }
};
