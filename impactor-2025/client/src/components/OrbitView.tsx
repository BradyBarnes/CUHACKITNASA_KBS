import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ImpactParameters } from '@/types';

interface OrbitViewProps {
  impactParams: ImpactParameters;
  className?: string;
}

const OrbitView: React.FC<OrbitViewProps> = ({ impactParams, className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const animationIdRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x0066cc,
      transparent: true,
      opacity: 0.8 
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.receiveShadow = true;
    earth.castShadow = true;
    scene.add(earth);

    // Earth atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Asteroid
    const asteroidSize = Math.max(impactParams.diameter / 1000, 0.05); // Scale down for visibility
    const asteroidGeometry = new THREE.SphereGeometry(asteroidSize, 16, 16);
    const asteroidMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xcc6600,
      roughness: 0.8
    });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.castShadow = true;
    
    // Position asteroid based on impact parameters
    const distance = 3; // Distance from Earth
    const angle = (impactParams.entryAngle * Math.PI) / 180;
    asteroid.position.set(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
      0
    );
    scene.add(asteroid);

    // Asteroid trail
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffaa00,
      transparent: true,
      opacity: 0.6
    });
    const trailPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const trailAngle = angle + (t * Math.PI * 0.5);
      trailPoints.push(new THREE.Vector3(
        Math.cos(trailAngle) * (distance + t * 2),
        Math.sin(trailAngle) * (distance + t * 2),
        Math.sin(t * Math.PI) * 0.5
      ));
    }
    trailGeometry.setFromPoints(trailPoints);
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.01,
      transparent: true,
      opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotate Earth
      earth.rotation.y += 0.005;
      earth.rotation.x += 0.002;

      // Rotate atmosphere
      atmosphere.rotation.y += 0.006;
      atmosphere.rotation.x += 0.003;

      // Rotate asteroid
      asteroid.rotation.x += 0.02;
      asteroid.rotation.y += 0.01;

      // Rotate stars slowly
      stars.rotation.x += 0.0001;
      stars.rotation.y += 0.0002;

      // Animate asteroid approach
      const time = Date.now() * 0.0005;
      asteroid.position.x = Math.cos(angle + time) * (distance - time * 0.5);
      asteroid.position.y = Math.sin(angle + time) * (distance - time * 0.5);
      asteroid.position.z = Math.sin(time * 2) * 0.2;

      // Update trail
      for (let i = 0; i < trailPoints.length - 1; i++) {
        trailPoints[i].copy(trailPoints[i + 1]);
      }
      trailPoints[trailPoints.length - 1].copy(asteroid.position);
      trailGeometry.setFromPoints(trailPoints);

      // Camera orbit
      camera.position.x = Math.cos(time * 0.1) * 8;
      camera.position.z = Math.sin(time * 0.1) * 8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    
    // Start animation
    setIsLoading(false);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [impactParams]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white text-sm">Loading 3D visualization...</p>
          </div>
        </div>
      )}
      <div 
        ref={mountRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Controls overlay */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <h4 className="font-medium mb-2">Orbit View</h4>
        <div className="space-y-1 text-xs text-gray-300">
          <div>Entry Angle: {impactParams.entryAngle}°</div>
          <div>Velocity: {impactParams.velocity} km/s</div>
          <div>Diameter: {impactParams.diameter}m</div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
        <h4 className="font-medium mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Earth</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Asteroid</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-yellow-500"></div>
            <span>Trajectory</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitView;
