<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  const ScaleControl = L.control.scale;
  //console.log(EasyButton);

  export default {
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        //console.log(this);
        return new ScaleControl({
          position: 'topright'
        });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };

</script>
