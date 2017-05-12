<!--
  wraps Leaflet.vector-markers as a vue component
  https://github.com/hiasinho/Leaflet.vector-markers
-->

<script>
  import L from 'leaflet';

  export default {
    props: [
      'icon',
      'orientation'
    ],
    render(h) {
      const a = this.$props.orientation
      return;
    },
    mounted() {
      // console.log('pngMarker mounted fired, latlng is', this.latlng);
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    updated() {
      // console.log('pngMarker updated fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    destroyed() {
      //console.log('pngMarker destroyed fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    computed: {
      latlng() {
        const xyz = this.$props.orientation.xyz;
        return [xyz[1], xyz[0]];
      },
      rotationAngle() {
        return this.$props.orientation.yaw * (180/3.14159265359);
      }
    },
    methods: {
      createLeafletElement() {
        const icon = L.icon({
            iconUrl: this.$props.icon,
            iconSize: [26, 16],
            iconAnchor: [11, 8],
          })
        return L.marker(this.latlng, {
          icon: icon,
          rotationAngle: this.rotationAngle,
        });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      },
    }
  };
</script>
