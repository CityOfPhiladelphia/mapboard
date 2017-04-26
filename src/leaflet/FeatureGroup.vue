<script>
  import { FeatureGroup }  from 'leaflet';

  const featureGroup = FeatureGroup;

  export default {
    // mounted() {
    //   const leafletElement = this.$leafletElement = this.createLeafletElement();
    //   const map = this.$store.state.map;
    //   // REVIEW kind of hacky/not reactive?
    //   if (map) {
    //     console.log('adding to map 1', map);
    //     leafletElement.addTo(map);
    //     console.log('added to map 1');
    //   }
    // },
    destroyed() {
      this.$leafletElement.clearLayers();
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        return new featureGroup();
      },
      parentMounted(parent) {
        const leafletElement = this.createLeafletElement();
        this.$leafletElement = leafletElement;
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
