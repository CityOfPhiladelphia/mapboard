<script>
  import { Circle }  from 'leaflet';
  import bindEvents from './utils/bind-events';

  export default {
    props: [
      'latlng',
      'size',
      'color',
      'weight'
    ],
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map;
      if (map) {
        leafletElement.addTo(map);
      }

      // bind events
      // TODO bind these lazily based on props
      const events = [
        'click',
        // 'dblclick',
        // 'mousedown',
        // 'mouseover',
        // 'mouseout',
        // 'contextmenu'
      ];
      bindEvents(this, this.$leafletElement, events);
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
        return new Circle(this.latlng, this.size, {
          color: this.color,
          weight: this.weight
        });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
