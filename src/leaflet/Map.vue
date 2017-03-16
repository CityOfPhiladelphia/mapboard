<template>
    <div id="map" />
</template>

<script>
  import L from 'leaflet';

  export default {
    mounted() {
      this.$leafletElement = this.createLeafletElement();
      
      // TEST
      this.$leafletElement.setView([39.951618, -75.1650911], 13);
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.$leafletElement);
    },
    methods: {
      createLeafletElement() {
        return L.map('map');
      }
    }
  };
</script>

<style>
  #map {
    height: 100%;
    weight: 100%;
  }
</style>
