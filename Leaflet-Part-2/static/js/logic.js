// Create a Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Create base map layers
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
});
var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox/satellite-v9',
  tileSize: 512,
  zoomOffset: -1,
  accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN'
});

// Create an object to hold the overlay layers
var overlays = {};

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
      if (depth < 10) {
        return '#00ff00'; // Green for shallow earthquakes
      } else if (depth < 50) {
        return '#ffff00'; // Yellow for intermediate earthquakes
      } else {
        return '#ff0000'; // Red for deep earthquakes
      }
    }

    // Create a GeoJSON layer for the earthquakes
    var earthquakeLayer = L.geoJSON(features, {
      pointToLayer: function (feature, latlng) {
        var magnitude = feature.properties.mag;
        var depth = feature.geometry.coordinates[2];

        // Create a circle marker with size and color based on magnitude and depth
        var marker = L.circleMarker(latlng, {
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

        return marker;
      }
    });

    // Add the earthquake layer to the overlays object with a name for the layer control
    overlays['Earthquakes'] = earthquakeLayer;
  });

// Fetch tectonic plates data from the provided GeoJSON file
fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json
