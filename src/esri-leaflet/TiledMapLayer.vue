<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  const EsriTiledMapLayer = L.esri.tiledMapLayer;

  export default {
    props: [
      'url',
      'minZoom',
      'maxZoom',
      'zIndex',
      'attribution'
    ],
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;

      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
        map.attributionControl.removeAttribution('overwrite');
      }
    },
    destroyed() {
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        const props = Object.assign({}, this.$props);
        const mapLayer = new EsriTiledMapLayer(props);
        return mapLayer;

      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
