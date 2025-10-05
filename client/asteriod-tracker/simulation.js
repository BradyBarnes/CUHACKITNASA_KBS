<<<<<<< HEAD
let map, marker, circle;
const NASA_API_KEY = "hsOmvaDKGOZkyNOb3oBTNmZC7agoQa3DbMvfygG5";
const NASA_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-08&end_date=2015-09-09&api_key=${NASA_API_KEY}`;

async function fetchAsteroidData() {
    try {
        const response = await fetch(NASA_URL);
        const data = await response.json();

        const asteroidList = Object.values(data.near_earth_objects).flat();
        const asteroidContainer = document.getElementById("asteroid-items");
        asteroidContainer.innerHTML = "";

        asteroidList.forEach(asteroid => {
            const li = document.createElement("li");
            li.textContent = asteroid.name;
            li.style.cursor = "pointer";
            li.style.padding = "5px";
            li.style.borderBottom = "1px solid #333";
            li.dataset.size = asteroid.estimated_diameter.meters.estimated_diameter_max;
            li.dataset.velocity = asteroid.close_approach_data[0].relative_velocity.kilometers_per_second;
            li.dataset.miss_distance = asteroid.close_approach_data[0].miss_distance.kilometers;

            li.addEventListener("click", () => selectAsteroid(li));
            asteroidContainer.appendChild(li);
        });

    } catch (error) {
        console.error("Failed to load asteroid data:", error);
        document.getElementById("asteroid-info").innerHTML =
            "<strong>Error:</strong> Could not load NASA asteroid data.";
    }
}

function selectAsteroid(element) {
    const name = element.textContent;
    const size = parseFloat(element.dataset.size).toFixed(2);
    const velocity = parseFloat(element.dataset.velocity).toFixed(2);
    const missDistance = parseFloat(element.dataset.miss_distance).toFixed(2);

    document.getElementById("asteroid-info").innerHTML = `
        <strong>Name:</strong> ${name}<br>
        <strong>Size:</strong> ${size} m<br>
        <strong>Velocity:</strong> ${velocity} km/s<br>
        <strong>Miss Distance:</strong> ${missDistance} km<br>
        <small>Click anywhere on the map to simulate an impact.</small>
    `;

    // Store selected asteroid data globally
    window.selectedAsteroid = { name, size, velocity };
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: "terrain"
    });

    fetchAsteroidData();

    map.addListener("click", (event) => {
        if (!window.selectedAsteroid) {
            alert("Please select an asteroid first from the list!");
            return;
        }

        const location = event.latLng;
        simulateImpact(location);
    });
}

function simulateImpact(location) {
    const asteroid = window.selectedAsteroid;
    if (!asteroid) return;

    // Remove old markers/circles
    if (marker) marker.setMap(null);
    if (circle) circle.setMap(null);

    // Calculate blast radius (simplified physics)
    const velocity = parseFloat(asteroid.velocity);
    const size = parseFloat(asteroid.size);
    const blastRadiusKm = Math.pow(size * velocity, 0.5) * 2;

    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: `${asteroid.name} Impact`
    });

    circle = new google.maps.Circle({
        strokeColor: "#FF4500",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF6347",
        fillOpacity: 0.35,
        map: map,
        center: location,
        radius: blastRadiusKm * 1000
    });

    document.getElementById("asteroid-info").innerHTML += `
        <br><strong>Impact Location:</strong> ${location.lat().toFixed(3)}, ${location.lng().toFixed(3)}<br>
        <strong>Blast Radius:</strong> ${blastRadiusKm.toFixed(1)} km
    `;
}
=======
let map, marker, circle;
const NASA_API_KEY = "hsOmvaDKGOZkyNOb3oBTNmZC7agoQa3DbMvfygG5";
const NASA_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-08&end_date=2015-09-09&api_key=${NASA_API_KEY}`;

async function fetchAsteroidData() {
    try {
        const response = await fetch(NASA_URL);
        const data = await response.json();

        const asteroidList = Object.values(data.near_earth_objects).flat();
        const asteroidContainer = document.getElementById("asteroid-items");
        asteroidContainer.innerHTML = "";

        asteroidList.forEach(asteroid => {
            const li = document.createElement("li");
            li.textContent = asteroid.name;
            li.style.cursor = "pointer";
            li.style.padding = "5px";
            li.style.borderBottom = "1px solid #333";
            li.dataset.size = asteroid.estimated_diameter.meters.estimated_diameter_max;
            li.dataset.velocity = asteroid.close_approach_data[0].relative_velocity.kilometers_per_second;
            li.dataset.miss_distance = asteroid.close_approach_data[0].miss_distance.kilometers;

            li.addEventListener("click", () => selectAsteroid(li));
            asteroidContainer.appendChild(li);
        });

    } catch (error) {
        console.error("Failed to load asteroid data:", error);
        document.getElementById("asteroid-info").innerHTML =
            "<strong>Error:</strong> Could not load NASA asteroid data.";
    }
}

function selectAsteroid(element) {
    const name = element.textContent;
    const size = parseFloat(element.dataset.size).toFixed(2);
    const velocity = parseFloat(element.dataset.velocity).toFixed(2);
    const missDistance = parseFloat(element.dataset.miss_distance).toFixed(2);

    document.getElementById("asteroid-info").innerHTML = `
        <strong>Name:</strong> ${name}<br>
        <strong>Size:</strong> ${size} m<br>
        <strong>Velocity:</strong> ${velocity} km/s<br>
        <strong>Miss Distance:</strong> ${missDistance} km<br>
        <small>Click anywhere on the map to simulate an impact.</small>
    `;

    // Store selected asteroid data globally
    window.selectedAsteroid = { name, size, velocity };
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: "terrain"
    });

    fetchAsteroidData();

    map.addListener("click", (event) => {
        if (!window.selectedAsteroid) {
            alert("Please select an asteroid first from the list!");
            return;
        }

        const location = event.latLng;
        simulateImpact(location);
    });
}

function simulateImpact(location) {
    const asteroid = window.selectedAsteroid;
    if (!asteroid) return;

    // Remove old markers/circles
    if (marker) marker.setMap(null);
    if (circle) circle.setMap(null);

    // Calculate blast radius (simplified physics)
    const velocity = parseFloat(asteroid.velocity);
    const size = parseFloat(asteroid.size);
    const blastRadiusKm = Math.pow(size * velocity, 0.5) * 2;

    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: `${asteroid.name} Impact`
    });

    circle = new google.maps.Circle({
        strokeColor: "#FF4500",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF6347",
        fillOpacity: 0.35,
        map: map,
        center: location,
        radius: blastRadiusKm * 1000
    });

    const infoBox = document.getElementById("asteroid-info");

    // Keep the asteroid’s base info text, but replace old impact info if it exists
    infoBox.innerHTML = `
        <strong>Name:</strong> ${asteroid.name}<br>
        <strong>Size:</strong> ${asteroid.size} m<br>
        <strong>Velocity:</strong> ${asteroid.velocity} km/s<br>
        <br><strong>Impact Location:</strong> ${location.lat().toFixed(3)}, ${location.lng().toFixed(3)}<br>
        <strong>Blast Radius:</strong> ${blastRadiusKm.toFixed(1)} km<br>
        <small>Click anywhere on the map to simulate an impact.</small><br>
    `;
<<<<<<< HEAD
}
=======

}
>>>>>>> cfe8db98c6cdb8f148e14541961b5d5ef856ea8c
>>>>>>> fc391b71d06814dcf36e4feecd420258f163af04
