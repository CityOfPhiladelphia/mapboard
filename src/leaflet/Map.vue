<template>
  <div class="map-container">
    <!-- the leaflet map -->
    <div class="map" ref="map" />
    <!-- container for vue elements wrapping leaflet elements. these aren't
         actually rendered, they just allow us to make the map reactive.
    -->
    <div>
      <slot />
    </div>
  </div>
</template>

<script>
  import { Map } from 'leaflet';

  export default {
    mounted() {
      this.$leafletElement = this.createLeafletElement();

      // TODO this should come from a prop
      this.$leafletElement.setView(this.$config.map.defaultXy, 13);

      // signal children to mount
      for (let child of this.$children) {
        child.mountTo(this);
      }
    },
    methods: {
      createLeafletElement() {
        return new Map(this.$refs.map);
      }
    }
  };
</script>

<style>
  .map-container {
    height: 100%;
  }
  .map {
    height: 100%;
  }
</style>
