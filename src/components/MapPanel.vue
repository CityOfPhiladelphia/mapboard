<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_>
      <!-- map layers/markers go here -->
    </Map_>
  </div>
</template>

<script>
  import Map_ from '../leaflet/Map';

  export default {
    components: {
      Map_
    }
  };
</script>
