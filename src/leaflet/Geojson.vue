<script>
  import { geoJSON } from 'leaflet';
  // pascal case
  const GeoJson = geoJSON;

  export default {
    props: [
      'geojson',
      'color',
      'weight'
    ],
    mounted() {
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
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        return new GeoJson(this.$props.geojson, {
          color: this.$props.color,
          weight: this.$props.weight
        });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };


</script>
