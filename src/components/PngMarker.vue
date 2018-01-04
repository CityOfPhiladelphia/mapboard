<!--
  wraps Leaflet.vector-markers as a vue component
  https://github.com/hiasinho/Leaflet.vector-markers
-->

<script>
  import L from 'leaflet';

  export default {
    props: [
      'icon',
      'latlng',
      'rotationAngle'
    ],
    render(h) {
      // for some reason, the react prop that `this.orientation` depends on has
      // to be evaluated once in order to receive updates.
      // this.orientation;

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
    destroyed() {
      //console.log('pngMarker destroyed fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    watch: {
      rotationAngle(nextRotationAngle) {
        // console.log('pngMarker orientation changed', nextRotationAngle);
        this.$leafletElement._map.removeLayer(this.$leafletElement);
        const leafletElement = this.$leafletElement = this.createLeafletElement();
        const map = this.$store.state.map.map;

        // REVIEW kind of hacky/not reactive?
        if (map) {
          leafletElement.addTo(map);
        }
      },
      latlng(nextLatLng) {
        // console.log('pngMarker orientation changed', nextRotationAngle);
        this.$leafletElement._map.removeLayer(this.$leafletElement);
        const leafletElement = this.$leafletElement = this.createLeafletElement();
        const map = this.$store.state.map.map;

        // REVIEW kind of hacky/not reactive?
        if (map) {
          leafletElement.addTo(map);
        }
      }
    },
    methods: {
      createLeafletElement() {
        const icon = L.icon({
            iconUrl: this.icon,
            iconSize: [26, 16],
            iconAnchor: [11, 8],
          })

        // console.log('createLeafletElement is running, this.latlng:', this.latlng);
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
