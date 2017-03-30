<script>
  import L from 'leaflet';
  // pascal case
  const EasyButton = L.easyButton;

  export default {
    // props: [
    //   'imagePath',
    //   'clickFunction'
    // ],
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
        return new EasyButton('<img src='+this.imagePath+'>',
        function(e){
          console.log(e);
        },
        {position: 'topright'})
        // return new EasyButton({
        //   id: 'baseToggleButton',
        //   position: 'topright',
        //   states: [{
        //     stateName: 'toggleToImagery',
        //     icon:      '<img src="css/images/imagery_small.png">',
        //     title:     'Toggle To Imagery',
        //     onClick: function(control) {
        //       console.log('click1');
        //       /*app.map.toggleBasemap();
  			// 			if (app.state.map.nameBaseLayer != 'baseMapLight' && app.state.map.nameBaseLayer != 'baseMapDORParcels') {
  			// 				// console.log('toggling button to basemap');
  	    //         control.state('toggletoBasemap');
  	    //       }*/
  			// 		}
        //   }, {
        //     stateName: 'toggletoBasemap',
        //     icon:      '<img src="css/images/basemap_small.png">',
        //     title:     'Toggle To Basemap',
        //     onClick: function(control) {
        //       console.log('click2');
        //       /*app.map.toggleBasemap();
  			// 			if (app.state.map.nameBaseLayer == 'baseMapLight' || app.state.map.nameBaseLayer == 'baseMapDORParcels') {
  			// 				// console.log('toggling button to imagery');
  			// 				control.state('toggleToImagery');
  			// 			}*/
        //     }
        //   }]
        // });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };
</script>
