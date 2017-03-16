<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  const EsriTiledMapLayer = L.esri.tiledMapLayer;

  export default {
    mounted() {
      this.$leafletElement = this.createLeafletElement();
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        return new EsriTiledMapLayer({
          // TODO this should come from a prop
          url: this.$config.map.basemap.url
        });
      },
      mountTo(mapVue) {
        const map = mapVue.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
