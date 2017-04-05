<!--
  wraps Leaflet.vector-markers as a vue component
  https://github.com/hiasinho/Leaflet.vector-markers
-->

<script>
  import L from 'leaflet';

  export default {
    props: [
      'latlng',
      'markerColor',
      'icon'
    ],
    render(h) {
      return;
    },
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    destroyed() {
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    methods: {
      createLeafletElement() {
        const icon = L.VectorMarkers.icon({
          icon:  this.$props.icon || 'circle',
          markerColor: this.$props.markerColor || '#2176d2'
        });
        return L.marker(this.$props.latlng, { icon });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      },
    }
  };
</script>
