<script>
  import L from 'leaflet';

  export default {
    props: ['position'],
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
    },
    destroyed() {
      this.$leafletElement._map.removeControl(this.$leafletElement);
    },
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        const MeasureTool = new L.Control.Measure({
  				position: this.$props.position,
  				primaryLengthUnit: 'feet',
  				primaryAreaUnit: 'sqfeet',
  			});
        return MeasureTool;
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        map.addControl(this.$leafletElement);
      }
    }
  };
</script>

<style>
</style>
