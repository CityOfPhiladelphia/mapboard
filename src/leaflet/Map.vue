<template>
  <div id="map"></div>
</template>

<script>
  const L = require('leaflet');

  export default {
    mounted() {
      // create leaflet map
      const map = this.$map = L.map('map');

      // TEST
      map.setView([51.505, -0.09], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
  };
</script>

<style>
  #map {
    height: 100%;
    weight: 100%;
  }
</style>
