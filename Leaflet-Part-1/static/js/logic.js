// Create a Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Add a tile layer for the base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

// Fetch earthquake data from the USGS GeoJSON API
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Access the features array in the GeoJSON data
    var features = data.features;

    // Define a function to determine the size of the marker based on earthquake magnitude
    function getMarkerSize(magnitude) {
      return magnitude * 4; // Adjust the multiplier to control the marker size
    }

    // Define a function to determine the color of the marker based on earthquake depth
    function getMarkerColor(depth) {
      if (depth < -10) {
        return '#00ff00'; // Green for depth -10 to 10 km
      } else if (depth < 10) {
        return '#33cc33'; // Light green for depth 10 to 30 km
      } else if (depth < 30) {
        return '#ffff00'; // Yellow for depth 30 to 50 km
      } else if (depth < 50) {
        return '#ffcc00'; // Orange for depth 50 to 70 km
      } else if (depth < 70) {
        return '#ff9933'; // Light orange for depth 70 to 90 km
      } else if (depth < 90) {
        return '#ff6600'; // Dark orange for depth 90+ km
      } else {
        return '#ff0000'; // Red for depth 90+ km
      }
    }

    // Iterate through the earthquake data and create markers
    features.forEach(feature => {
      var coordinates = feature.geometry.coordinates;
      var magnitude = feature.properties.mag;
      var depth = coordinates[2];

      // Create a circle marker with size and color based on magnitude and depth
      var marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: getMarkerSize(magnitude),
        fillColor: getMarkerColor(depth),
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Create a popup with additional information about the earthquake
      var popupContent = `
        <b>Magnitude:</b> ${magnitude}<br>
        <b>Depth:</b> ${depth}<br>
        <b>Location:</b> ${feature.properties.place}
      `;
      marker.bindPopup(popupContent);

      // Add the marker to the map
      marker.addTo(map);
    });

    // Create a legend
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'legend');
      var depths = [-10, 10, 30, 50, 70, 90];
    
      div.innerHTML += '<h4>Depth</h4>';

      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<div class="legend-item">' +
          '<span class="legend-color" style="background-color:' + getMarkerColor(depths[i] + 1) + '"></span>' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+') +
          '</div>';
      }

      return div;
    };

    legend.addTo(map);
  });

