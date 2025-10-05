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
        console.log('Initializing Asteroid Fun Facts system...');
        
        // Use event delegation for better performance and dynamic asteroid support
        document.addEventListener('click', (e) => {
            const asteroid = e.target.closest('.asteroid');
            if (asteroid) {
                e.preventDefault();
                e.stopPropagation();
                this.showRandomFact(e);
            }
        });
        
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
    
    
    showRandomFact(event) {
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
        const asteroid = event.target.closest('.asteroid');
        if (asteroid) {
            asteroid.style.animation = 'none';
            setTimeout(() => {
                asteroid.style.animation = 'asteroidFloat 3s ease-in-out infinite';
            }, 100);
        }
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }
}

// ==================== ASTEROID ORBITAL SYSTEM ====================
class AsteroidOrbitalSystem {
    constructor() {
        this.asteroids = [];
        this.init();
    }
    
    init() {
        console.log('Initializing Asteroid Orbital System...');
        this.createAsteroids();
        this.startOrbitalAnimation();
    }
    
    createAsteroids() {
        const asteroidContainer = document.querySelector('.earth-container');
        if (!asteroidContainer) return;
        
        // Create additional asteroids for more dynamic system
        const asteroidData = [
            { orbit: 'orbit-1', size: 'small', speed: 1.0 },
            { orbit: 'orbit-2', size: 'medium', speed: 0.8 },
            { orbit: 'orbit-3', size: 'large', speed: 0.6 },
            { orbit: 'orbit-4', size: 'small', speed: 1.2 },
            { orbit: 'orbit-5', size: 'medium', speed: 0.9 }
        ];
        
        asteroidData.forEach((data, index) => {
            const orbitDiv = document.createElement('div');
            orbitDiv.className = `asteroid-orbit ${data.orbit}`;
            
            const asteroidDiv = document.createElement('div');
            asteroidDiv.className = `asteroid asteroid-rock asteroid-${data.size}`;
            asteroidDiv.dataset.size = data.size;
            asteroidDiv.dataset.speed = data.speed;
            
            orbitDiv.appendChild(asteroidDiv);
            asteroidContainer.appendChild(orbitDiv);
            
            this.asteroids.push({
                element: asteroidDiv,
                orbit: orbitDiv,
                speed: data.speed,
                angle: Math.random() * 360
            });
        });
    }
    
    startOrbitalAnimation() {
        const animate = () => {
            this.asteroids.forEach(asteroid => {
                asteroid.angle += asteroid.speed * 0.5;
                asteroid.orbit.style.transform = `rotate(${asteroid.angle}deg)`;
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// ==================== INITIALIZATION ====================
// Initialize the asteroid systems when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the fun facts system
    if (!window.asteroidFunFacts) {
        window.asteroidFunFacts = new AsteroidFunFacts();
    }
    
    // Initialize the orbital system
    if (!window.asteroidOrbitalSystem) {
        window.asteroidOrbitalSystem = new AsteroidOrbitalSystem();
    }
});

// Reinitialize asteroid listeners when needed
window.reinitializeAsteroids = function() {
    if (window.asteroidFunFacts) {
        setTimeout(() => {
            window.asteroidFunFacts.addAsteroidListeners();
        }, 200);
    }
};
