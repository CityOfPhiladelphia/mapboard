<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  const EasyButton = L.easyButton;
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
        return EasyButton({
          id: 'baseToggleButton',
          position: 'topright',
          states: [{
            stateName: 'toggleToImagery',
            icon:      '<img src="../../src/assets/imagery_small.png">',
            title:     'Toggle To Imagery',
            // onClick: function(control) {
            //   //console.log(this);
            //   //console.log(this.$store.state.base);
            //   //this.$store.commit('setBase', 'imagery');
            //   //this.setBase('imagery');
            //   control.state('toggletoBasemap');
            // }
          }, {
            stateName: 'toggletoBasemap',
            icon:      '<img src="../../src/assets/basemap_small.png">',
            title:     'Toggle To Basemap',
            // onClick: function(control) {
            //   //this.$store.commit('setBase', 'basemap');
            //   control.state('toggleToImagery');
            // }
          }]
        });

      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };

</script>
