let map;
let asteroidData = [];
let asteroidMarkers = [];
let asteroidCircle = null;

function initMap() {
    // Create the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
    });

    // Fetch asteroid data
    fetchAsteroidData();
}

async function fetchAsteroidData() {
    const apiKey = "hsOmvaDKGOZkyNOb3oBTNmZC7agoQa3DbMvfygG5";
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.near_earth_objects || !data.near_earth_objects[today]) {
            throw new Error("No asteroid data available.");
        }

        asteroidData = data.near_earth_objects[today];
        populateAsteroidList();

    } catch (error) {
        console.error("Error fetching asteroid data:", error);
        document.getElementById("asteroid-info").innerText = "Failed to load asteroid data.";
    }
}

function populateAsteroidList() {
    const list = document.getElementById("asteroid-items");
    list.innerHTML = "";

    asteroidData.forEach((asteroid, index) => {
        const li = document.createElement("li");
        li.style.cursor = "pointer";
        li.style.padding = "8px";
        li.style.borderBottom = "1px solid #555";
        li.innerHTML = `
            <strong>${asteroid.name}</strong><br>
            Size: ${asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)} m<br>
            Velocity: ${parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s
        `;

        // On click → show this asteroid
        li.addEventListener("click", () => {
            displayAsteroidOnMap(asteroid);
        });

        list.appendChild(li);
    });
}

function displayAsteroidOnMap(asteroid) {
    const infoBox = document.getElementById("asteroid-info");
    infoBox.innerHTML = `
        <strong>Asteroid:</strong> ${asteroid.name}<br>
        <strong>Diameter:</strong> ${asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)} m<br>
        <strong>Velocity:</strong> ${parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(2)} km/s<br>
        <strong>Miss Distance:</strong> ${parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers).toFixed(0)} km
    `;

    // Fixed impact location (New York for now)
    const impactLocation = { lat: 40.7128, lng: -74.0060 };

    // Remove old marker/circle
    asteroidMarkers.forEach(m => m.setMap(null));
    asteroidMarkers = [];
    if (asteroidCircle) asteroidCircle.setMap(null);

    // Add marker
    const marker = new google.maps.Marker({
        position: impactLocation,
        map,
        title: asteroid.name,
    });
    asteroidMarkers.push(marker);

    // Add impact radius circle
    const radius = asteroid.estimated_diameter.meters.estimated_diameter_max * 50; 
    asteroidCircle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map,
        center: impactLocation,
        radius: radius,
    });

    // Center on impact
    map.setCenter(impactLocation);
    map.setZoom(6);
}
