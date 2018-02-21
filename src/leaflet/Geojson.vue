<script>
  import { geoJSON } from 'leaflet';
  // pascal case
  const GeoJson = geoJSON;

  export default {
    props: [
      'geojson',
      'color',
      'weight',
      'data'
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
        const props = this.$props;
        const {
          geojson,
          ...options
        } = props;

        console.log('geojson', geojson)
        const newGeojson = new GeoJson(geojson, options);
        //this.$store.commit('setCircleMarkers', newCircleMarker);
        return newGeojson;
        // if the geoJSON feature is a point, it needs to be styled through "pointToLayer"
        // const type = this.$props.overlay.type;
        // const style = this.$props.overlay.style;
        // return new GeoJson(this.$props.geojson, {
        //   color: this.$props.color,
        //   weight: this.$props.weight,
        //   // pointToLayer: function (feature, latlng) {
      	// 	// 	return type(latlng, style)
        //   // }
        // });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };


</script>
