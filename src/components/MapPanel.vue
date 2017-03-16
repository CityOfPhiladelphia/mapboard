<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_>
      <!-- map content goes here -->
      <EsriTiledMapLayer />
    </Map_>
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';

  export default {
    components: {
      Map_,
      EsriTiledMapLayer
    }
  };
</script>
