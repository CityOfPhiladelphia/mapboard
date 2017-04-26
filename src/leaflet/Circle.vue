<script>
  import { Circle }  from 'leaflet';

  const circle = Circle;

  export default {
    props: [
      'latlng',
      'size',
      'color',
      'weight'
    ],
    mounted() {
    //  this.latlng = this.latlngComp;
    //  const leafletElement = this.$leafletElement = this.createLeafletElement();
    //   const map = this.$store.state.map;
    //   // if (map) {
    //   //   leafletElement.addTo(map);
    //   // }
    },
    destroyed() {
      this.$leafletElement.clearLayers();
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render(h) {
      return;
    },
    computed: {
      latlngComp() {
        return this.$config.map.center;
      }
    },
    methods: {
      createLeafletElement() {
        console.log('Circle createLeafletElement running');
        return new circle(this.latlng, this.size, {
          color: this.color,
          weight: this.weight
        });
      },
      parentMounted(parent) {
        console.log('Circle parent mounted running');
        this.latlng = this.$config.map.center;
        const leafletElement = this.createLeafletElement();
        this.$leafletElement = leafletElement;
        console.log('Circle.vue is defining map as parent.$leafletElement');
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
