<!--
  wraps Leaflet.vector-markers as a vue component
  https://github.com/hiasinho/Leaflet.vector-markers
-->

<script>
  import L from 'leaflet';

  export default {
    props: [
      'icon',
    ],
    render(h) {
      // for some reason, the react prop that `this.orientation` depends on has
      // to be evaluated once in order to receive updates.
      this.orientation;

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
        const xyz = this.orientation.xyz;
        return [xyz[1], xyz[0]];
      },
      rotationAngle() {
        return this.orientation.yaw * (180/3.14159265359);
      },
      orientation() {
        // access the orientation prop of the cyclomedia react component
        return this.$store.state.cyclomedia.viewer.props.orientation;
      }
    },
    methods: {
      createLeafletElement() {
        const icon = L.icon({
            iconUrl: this.icon,
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
