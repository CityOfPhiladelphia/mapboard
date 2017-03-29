<script>
  import L from 'leaflet';

  const SearchControl = L.Control.extend({
    onAdd: (map) => {
      // REVIEW we might only have to construct the container div using
      // L.DomUtil
      const container = L.DomUtil.create('div', 'mb-search-control-container');

      const input = L.DomUtil.create('input', 'mb-search-control-input');
      input.placeholder = 'Search the map';

      const button = L.DomUtil.create('button', 'mb-search-control-button');
      const buttonIcon = L.DomUtil.create('i', 'fa fa-search fa-lg');
      button.appendChild(buttonIcon);

      // prevent clicks/drags from propagating to map
      for (let el of [container, input]) {
        // REVIEW there's probably some best practice around checking
        // L.Browser.touch before disabling click propagation. See:
        // http://gis.stackexchange.com/questions/104507/disable-panning-dragging-on-leaflet-map-for-div-within-map
        L.DomEvent.disableClickPropagation(el);
      }

      container.appendChild(input);
      container.appendChild(button);

      return container;
    }
  });

  export default {
    props: ['position'],
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    destroyed() {
      this.$store.state.map.removeControl(this.$leafletElement);
    },
    render(h) {
      return;
    },
    methods: {
      createLeafletElement() {
        return new SearchControl({
          position: this.position,
        });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        map.addControl(this.$leafletElement);
      }
    }
  };
</script>

<style>
  .mb-search-control-container {
    height: 48px;
    border-radius: 2px;
    box-shadow:0 2px 4px rgba(0,0,0,0.2),0 -1px 0px rgba(0,0,0,0.02);
  }

  .mb-search-control-button {
    width: 50px;
    background: #ccc;
    line-height: 48px;
  }

  .mb-search-control-input {
    border: 0;
    height: 48px !important;
    line-height: 48px;
    padding: 10px;
    padding-left: 15px;
    padding-right: 15px;
    font-family: 'Montserrat', 'Tahoma', sans-serif;
    font-size: 16px;
    width: 400px;
  }
</style>
