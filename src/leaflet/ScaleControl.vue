<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  const ScaleControl = L.control.scale;

  export default {
    props: [
      'vSide',
      'hSide'
    ],
    mounted() {
      //console.log('scalecontrol', this.$parent)
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      //const map = this.$store.state.map;
      // REVIEW kind of hacky/not reactive?
      /*if (map) {
        //map._controlCorners['top' + 'almostright'] = L.DomUtil.create('div', 'leaflet-top leaflet-almostright', map._controlContainer);
        console.log('test scale control')
        //leafletElement.addTo(map);
        // leafletElement._container = L.DomUtil.get('basemap-toggle')
      }*/
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        //console.log('scalecontrol create')
        return new ScaleControl({
          position: 'topalmostright'
        });
        //const map = this.$store.state.map;

      },
      parentMounted(parent, grandparent) {
        const map = parent.$leafletElement
        console.log('scaleControl', map)
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
