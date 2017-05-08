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
    data: function() {
      return {
        thelatlng: this.$props.latlng
      }
    },
    render(h) {
      // console.log('render');
      //console.log('render', this.thelatlng);
      //console.log('render', this.$props.latlng);
      //console.log('render', this.latlng);
      const a = this.$props.latlng;
      return;
      //return this.$props.latlng;
    },
    mounted() {
      console.log('vectorMarker mounted fired, latlng is', this.latlng);
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    // beforeUpdate(){
    //   // console.log('vectorMarker beforeUpdate fired, latlng is', this.latlng);
    // },
    updated() {
      // console.log('vectorMarker updated fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    destroyed() {
      //console.log('vectorMarker destroyed fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    computed: {
      latlng() {
        return this.$props.latlng;
      }
    },
    methods: {
      createLeafletElement() {
        // console.log('creating vectorMarker at', this.latlng);
        // console.log(this.$store.state.cyclomedia.viewer.props.orientation.xyz);
        const icon = L.VectorMarkers.icon({
          icon:  this.$props.icon || 'circle',
          markerColor: this.$props.markerColor || '#2176d2'
        });
        return L.marker(this.latlng, { icon });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      },
    }
  };
</script>
