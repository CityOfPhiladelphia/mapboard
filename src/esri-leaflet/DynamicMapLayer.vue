<template>
  <opacity-slider :layer="this.$leafletElement"
                  :position="'topleft'"
                  :initialOpacity="opacity"
  />
</template>
<script>
  import L from 'leaflet';
  // TODO things in esri-leaflet should be standalone and not depend on
  // mapboard components. pass this in as a prop/plugin rather than importing.
  import OpacitySlider from '../components/OpacitySlider.vue';
  // TODO look into a cleaner way of importing from esri-leaflet
  const EsriDynamicMapLayer = L.esri.dynamicMapLayer;

  export default {
    components: {
      OpacitySlider
    },
    props: {
      url: {

      },
      minZoom: {

      },
      maxZoom: {

      },
      zIndex: {

      },
      opacity: {
        default: 1.0
      },
      layers: {

      },
      layerDefs: {

      },
      transparent: {

      },
    },
    created() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    destroyed() {
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    // render(h) {
    //   return;
    // },
    computed: {

    },
    methods: {
      createLeafletElement() {
        const props = Object.assign({}, this.$props);
        return new EsriDynamicMapLayer(props);
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
