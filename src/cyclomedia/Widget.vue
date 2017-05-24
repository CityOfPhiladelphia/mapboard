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
        console.log('computed')
        const lastSearchMethod = this.$store.state.lastSearchMethod;
        const geocodeData = this.$store.state.geocode.data;
        const map = this.$store.state.map.map;
        let center;
        let sendLoc;
        if (lastSearchMethod === 'geocode') {
          sendLoc = geocodeData.geometry.coordinates;
        }
        else if (!geocodeData) {
          center = map.getCenter();
          sendLoc = [center.lng, center.lat];
        } else {
          sendLoc = geocodeData.geometry.coordinates;
        }
        console.log(sendLoc);
        //this.setNewLocation(sendLoc);
        return sendLoc
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

          // get map center and set location
          const map = this.$store.state.map.map;
          const center = map.getCenter();
          this.setNewLocation([center.lng, center.lat]);

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
    updated() {
      console.log('widget.vue updated is firing');
    },
    methods: {
      setNewLocation(coords) {
        // console.log('setNewLocation is running using', coords);
        const viewer = this.$store.state.cyclomedia.viewer;
        viewer.openByCoordinate(coords);
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
