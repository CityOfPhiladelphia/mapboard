<script>
  import { Marker } from 'leaflet';

  export default {
    props: [
      'latlng'
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
    updated() {
      console.log('updated')
      this.$leafletElement.setLatLng(this.$props.latlng);
    },
    destroyed() {
      console.log('destroyed')
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    methods: {
      createLeafletElement() {
        return new Marker(this.$props.latlng);
      },
      parentMounted(parent) {
        console.log('parent mounted')
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      },
    }
  };
</script>
