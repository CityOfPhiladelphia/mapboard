<template>
  <div class="large-16 columns mb-panel"
       id="cyclo-container"
       v-once
       style="height: 50%;"
  >
    <div id="cycloviewer" ref="cycloviewer" class="panoramaViewerWindow" />
  </div>
</template>

<script>
  export default {
    computed: {
      locForCyclo() {
        this.getLocForCyclo();
      }
    },
    mounted() {
      StreetSmartApi.init({
        username: this.$config.cyclomedia.username,
        password: this.$config.cyclomedia.password,
        apiKey: this.$config.cyclomedia.apiKey,
        srs: 'EPSG:4326',
        locale: 'en-us',
        addressSettings: {
          locale: 'en-us',
          database: 'CMDatabase'
        }
      }).then(
        () => {
          const cycloDiv = this.$refs.cycloviewer;
          const viewer = StreetSmartApi.addPanoramaViewer(cycloDiv, {recordingsVisible: true, timeTravelVisible: true});
          this.$store.commit('setCyclomediaViewer', viewer);
          this.getLocForCyclo();

          // get map center and set location
          // const map = this.$store.state.map.map;
          // const center = map.getCenter();
          // console.log('center is', center);
          this.setNewLocation(this.$store.state.cyclomedia.locFromApp);

          // TODO bind CN events to vue
          // viewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_CHANGE, e => {
          //
          // });
          // viewer.on(StreetSmartApi.Events.panoramaViewer.VIEW_LOAD_END, e => {
          //   const recording = viewer.getRecording();
          //   const xyz = recording.xyz;
          //   const xy = xyz.slice(0, 2);
          //   const xyFloat = xy.map(parseFloat);
          //   const xyArray = [].slice.call(xyFloat);
          // });
        },
        err => {
          console.log('Api: init: failed. Error: ', err);
        }
      );
    },
    methods: {
      getLocForCyclo() {
        console.log('getLocForCyclo is running');
        const lastClick = this.$store.state.lastClick;
        const viewer = this.$store.state.cyclomedia.viewer;
        const xyz = viewer.props.orientation.xyz;
        const geocodeData = this.$store.state.geocode.data;
        const map = this.$store.state.map.map;
        let sendLoc;

        if (lastClick === 'search') {
          sendLoc = geocodeData.geometry.coordinates
          console.log('the last thing clicked was the searchbar, using geocoded', sendLoc);
        }
        // if viewer does not have xy yet
        else if (xyz[0] === 0) {
          // if geocodeData does not have data yet
          if (!geocodeData) {
            sendLoc = map.getCenter();
            console.log('set sendLoc from center:', sendLoc);
          } else {
            sendLoc = geocodeData.geometry.coordinates
            console.log('set sendLoc from geocodeData:', sendLoc);
          }
        }
        else {
          console.log('running the else');
          sendLoc = [orientationXYZ[1], orientationXYZ[0]];
          console.log('cyclomedia already has an xyz', sendLoc);
        }
        console.log(sendLoc.lat, sendLoc.lng);
        this.$store.commit('setCyclomediaLocFromApp', sendLoc);
        // return sendLoc;
      },
      setNewLocation(latlng) {
        console.log(latlng);
        const viewer = this.$store.state.cyclomedia.viewer;
        const xy = [latlng.lng, latlng.lat];
        viewer.openByCoordinate(xy);
        // const xyz = viewer.props.orientation.xyz;
        // console.log([xyz[1], xyz[0]]);
        // this.$store.commit('setCyclomediaLocFromViewer', [xyz[1], xyz[0]]);
      },
    }
    };
</script>

<style>

#cyclo-container {
  padding: 0px;
}

.panoramaViewerWindow {
  /*display: inline-block;*/
  display: block;
  width: 100%;
  height:100%;
}
</style>
