async function initSimulationMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;
  
    // Create map
    const map = new google.maps.Map(mapElement, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      mapTypeId: "terrain",
    });
  
    // Example asteroid (you can replace this with live NASA data)
    const asteroid = {
      name: "(2008 SS)",
      diameter_km: 0.2,
      velocity_kms: 14.5,
      miss_distance_km: 17860588,
      blast_radius_km: 10,
    };
  
    // Plot impact at random near Earth (you can geolocate later)
    const impactPoint = { lat: 40.7128, lng: -74.006 }; // New York for now
  
    new google.maps.Circle({
      map,
      center: impactPoint,
      radius: asteroid.blast_radius_km * 1000,
      strokeColor: "#FF4500",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF4500",
      fillOpacity: 0.35,
    });
  
    new google.maps.Marker({
      map,
      position: impactPoint,
      title: `${asteroid.name} Impact`,
    });
  
    document.getElementById("simulation-info").innerHTML = `
      <strong>${asteroid.name}</strong><br>
      Diameter: ${asteroid.diameter_km} km<br>
      Velocity: ${asteroid.velocity_kms} km/s<br>
      Miss Distance: ${(asteroid.miss_distance_km / 1000).toFixed(0)} Mm<br>
      Estimated Blast Radius: ${asteroid.blast_radius_km} km
    `;
  }
  
  // Only initialize when simulation section is visible
  document.addEventListener("DOMContentLoaded", () => {
    const simSection = document.getElementById("simulation-section");
    const observer = new MutationObserver(() => {
      if (simSection.classList.contains("active")) {
        initSimulationMap();
      }
    });
  
    observer.observe(simSection, { attributes: true });
  });
  