<script>
  //import FeatureGroup from '../leaflet/FeatureGroup';
  import Circle_ from '../leaflet/Circle';

  const {props, methods} = Circle_;
  //const {methods} = FeatureGroup;

  export default {
    props: [
      'size',
      'color',
      'weight'
    ],
    mounted() {
      const map = this.$store.state.map;
      this.prepareCycloBbox(map);
    },
    render(h) {
      return;
    },
    computed: {
      // map() {
      //   return this.$store.state.map
      // }
      // latlng() {
      //   return this.$config.map.center;
      // }
    },
    methods: Object.assign(methods, {
      prepareCycloBbox(map) {
        console.log('prepareCycloBbox is running');
        let view = map.getBounds();
        let zoomLevel = map.getZoom();
        console.log(zoomLevel);
        // if (zoomLevel < 19) {
        //   _cycloFeatureGroup.clearLayers();
        // };
        if (zoomLevel > 17) {
          var newSWCoord = proj4('EPSG:3857', [view._southWest.lng, view._southWest.lat]);
          var newNECoord = proj4('EPSG:3857', [view._northEast.lng, view._northEast.lat]);
          wfsClient.loadBbox(newSWCoord[0], newSWCoord[1], newNECoord[0], newNECoord[1], this.addCycloCircles, this.$config.cyclomedia.username, this.$config.cyclomedia.password);
        }
      },
      addCycloCircles() {
        console.log('addCycloCircles is running');
        const list = wfsClient.recordingList;
        console.log(list);
        //console.log('listlength', list.length);
        if (list.length > 0) {
          const b = [];
          for (let rec of list) {
            var coordRaw = [rec.lon, rec.lat];
            var coordNotFlipped = proj4('EPSG:3857', 'EPSG:4326', coordRaw);
            var coord = [coordNotFlipped[1], coordNotFlipped[0]];
            b.push(coord);
            //console.log(coord);
            // var blueCircle = new L.circle(coord, 1.2, {
            //   color: '#3388ff',
            //   weight: 1,
            // }).on('click', function(coord){
            //   console.log('clicked circle');
            //   //app.state.map.clickedCircle = 'true';
            //
            //   // SET LOCAL STORAGE
            //   //app.map.LSclickedCircle(coord.latlng.lat, coord.latlng.lng);
            //
            //   // DIRECTLY CHANGE CYCLO-WINDOW
            //   //app.cyclo.setNewLocation();
            //
            // });
            // //blueCircle.on({click: // console.log('clicked a circle')});
            // blueCircle.addTo(_cycloFeatureGroup);
          }
          console.log(b)
          //_cycloFeatureGroup.bringToFront();
        }
      }
    })
  };



</script>
