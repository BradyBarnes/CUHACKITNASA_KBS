// 3D Earth Globe using Three.js
class EarthGlobe {
    constructor() {
        this.container = document.getElementById('globe-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.animationId = null;
        this.rotationSpeed = 0.005;

        this.init();
    }

    async init() {
        if (!this.container) {
            console.error('Globe container not found');
            return;
        }

        console.log('Initializing Earth Globe...');
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 2;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);

        await this.createEarth(); // ⬅ wait for texture load
        this.setupLighting();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());

        console.log('Earth Globe initialized successfully!');

        setTimeout(() => {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }, 1000);
    }

    // ✅ Create Earth with fallback + atmosphere
    async createEarth() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const loader = new THREE.TextureLoader();

        const urls = [
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
            'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        ];

        // wait for async texture to load
        const earthTexture = await this.loadTextureWithFallback(loader, urls);
        const normalTexture = await new Promise((resolve) => {
            loader.load(
                'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
                tex => resolve(tex),
                undefined,
                () => resolve(null)
            );
        });

        [earthTexture, normalTexture].forEach(tex => {
            if (!tex) return;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.flipY = false;
        });

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            normalMap: normalTexture || null,
            shininess: 30,
            specular: new THREE.Color(0x333333),
            normalScale: new THREE.Vector2(0.8, 0.8),
            color: 0xffffff
        });

        this.earth = new THREE.Mesh(geometry, material);
        this.earth.rotation.x = Math.PI;
        this.scene.add(this.earth);

        this.addAtmosphere();
    }

    // 🌎 Texture fallback system (returns a Promise)
    loadTextureWithFallback(loader, urls) {
        return new Promise(resolve => {
            let index = 0;
            const tryLoad = () => {
                if (index >= urls.length) {
                    console.warn('All texture URLs failed, using procedural fallback');
                    resolve(this.createProceduralTexture());
                    return;
                }
                const url = urls[index];
                loader.load(
                    url,
                    tex => {
                        console.log(`Loaded texture from ${url}`);
                        resolve(tex);
                    },
                    undefined,
                    () => {
                        console.warn(`Failed to load ${url}`);
                        index++;
                        tryLoad();
                    }
                );
            };
            tryLoad();
        });
    }

    // 🎨 Procedural fallback texture
    createProceduralTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.3, '#3b82f6');
        gradient.addColorStop(0.7, '#60a5fa');
        gradient.addColorStop(1, '#93c5fd');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = '#16a34a';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random() * 512, Math.random() * 512, 100, 70, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.flipY = false;
        return texture;
    }

    addAtmosphere() {
        const geo = new THREE.SphereGeometry(1.05, 64, 64);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        this.scene.add(new THREE.Mesh(geo, mat));
    }

    // 💡 Lighting
    setupLighting() {
        const ambient = new THREE.AmbientLight(0x404040, 0.4);
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(10, 5, 5);
        const rim = new THREE.DirectionalLight(0x87ceeb, 0.3);
        rim.position.set(-5, 3, -5);
        this.scene.add(ambient, sun, rim);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        if (this.earth) this.earth.rotation.y += this.rotationSpeed;
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        window.removeEventListener('resize', this.onWindowResize);
    }
}

// --- Initialization Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.earthGlobe) window.earthGlobe = new EarthGlobe();
    } catch (err) {
        console.error('Failed to initialize Earth Globe:', err);
    }
});

document.addEventListener('click', (e) => {
    if (e.target.dataset.page === 'home') {
        setTimeout(() => {
            try {
                if (window.earthGlobe) {
                    window.earthGlobe.destroy();
                    window.earthGlobe = null;
                }
                window.earthGlobe = new EarthGlobe();
            } catch (err) {
                console.error('Failed to reinitialize Earth Globe:', err);
            }
        }, 100);
    }
});

const observer = new MutationObserver(() => {
    const homeSection = document.getElementById('home-section');
    if (homeSection && homeSection.classList.contains('active')) {
        setTimeout(() => {
            try {
                if (window.earthGlobe) {
                    window.earthGlobe.destroy();
                    window.earthGlobe = null;
                }
                window.earthGlobe = new EarthGlobe();
            } catch (err) {
                console.error('Failed to reinitialize Earth Globe on transition:', err);
            }
        }, 100);
    }
});

const homeSection = document.getElementById('home-section');
if (homeSection) {
    observer.observe(homeSection, { attributes: true, attributeOldValue: true });
}
