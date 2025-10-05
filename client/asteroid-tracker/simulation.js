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
        <small>Click anywhere on the map to simulate an impact.</small><br>
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

    const baseVelocity = parseFloat(asteroid.velocity);
    const baseSize = parseFloat(asteroid.size);
    let blastRadiusKm = Math.pow(baseSize * baseVelocity, 0.5) * 2; // base radius

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
    infoBox.innerHTML = `
        <strong>Name:</strong> ${asteroid.name}<br>
        <strong>Size:</strong> <span id="asteroid-size">${baseSize.toFixed(2)}</span> m<br>
        <strong>Velocity:</strong> <span id="asteroid-velocity">${baseVelocity.toFixed(2)}</span> km/s<br>
        <br><strong>Impact Location:</strong> ${location.lat().toFixed(3)}, ${location.lng().toFixed(3)}<br>
        <strong>Blast Radius:</strong> <span id="blast-radius-value">${blastRadiusKm.toFixed(1)}</span> km<br>
        <label for="mitigation-slider"><small>Mitigation Effectiveness (0.5× to 1.5×):</small></label><br>
        <input type="range" id="mitigation-slider" min="0.5" max="1.5" step="0.05" value="1" style="width:100%;">
        <small>Slide left for stronger mitigation (smaller asteroid/velocity)</small><br>
    `;

    const slider = document.getElementById("mitigation-slider");
    const sizeSpan = document.getElementById("asteroid-size");
    const velocitySpan = document.getElementById("asteroid-velocity");
    const radiusValue = document.getElementById("blast-radius-value");

    slider.addEventListener("input", () => {
        const mitigation = parseFloat(slider.value);

        // Apply mitigation: reduce both size and velocity proportionally
        const newSize = baseSize * mitigation;
        const newVelocity = baseVelocity * mitigation;
        const newRadiusKm = Math.pow(newSize * newVelocity, 0.5) * 2;

        // Update display
        sizeSpan.textContent = newSize.toFixed(2);
        velocitySpan.textContent = newVelocity.toFixed(2);
        radiusValue.textContent = newRadiusKm.toFixed(1);

        // Update map visualization
        circle.setRadius(newRadiusKm * 1000);

        // Update circle color for effect
        const colorScale = Math.min(255, Math.floor(255 * mitigation));
        circle.setOptions({
            fillColor: `rgb(255, ${Math.floor(100 + colorScale / 2)}, ${Math.floor(100 + colorScale / 3)})`,
            strokeColor: `rgb(255, ${Math.floor(50 + colorScale / 2)}, ${Math.floor(50 + colorScale / 3)})`
        });
    });
}
