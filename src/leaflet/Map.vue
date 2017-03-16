<template>
    <div class="map" />
</template>

<script>
  import { Map } from 'leaflet';

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
        return new Map(this.$el);
      }
    }
  };
</script>

<style scoped>
  .map {
    height: 100%;
    weight: 100%;
  }
</style>
