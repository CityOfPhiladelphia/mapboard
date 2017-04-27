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
    mounted() {
      StreetSmartApi.init({
        username: this.$config.cyclomedia.username,
        password: this.$config.cyclomedia.password,
        apiKey: this.$config.cyclomedia.apiKey,
        srs: "EPSG:4326",
        locale: 'en-us',
        addressSettings: {
          locale: "en-us",
          database: "CMDatabase"
        }
      }).then(
        () => {
          var cycloDiv = this.$refs.cycloviewer
          var viewer = StreetSmartApi.addPanoramaViewer(cycloDiv, {recordingsVisible: true, timeTravelVisible: true});
          viewer.openByCoordinate([parseFloat(-75.163596), parseFloat(39.952388)]);
          this.$store.commit('setCyclomediaViewer', viewer);

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
          // alert('Api Init Failed!');
        }
      );
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

  //     // function setInitLocation - set initial state location from localStorage or default
  //     setInitLocation: function () {
  //       //console.log('running setInitLocation - got things from localStorage');
  //       if(localStorage.getItem('leafletForCycloX')) {
  //         console.log('found leafletForCycloX');
  //         app.state.leafletForCycloX = localStorage.getItem('leafletForCycloX');
  //       } else {
  //         console.log('used default X')
  //         app.state.leafletForCycloX = app.default.leafletForCycloX;
  //       }
  //       if(localStorage.getItem('leafletForCycloY')) {
  //         app.state.leafletForCycloY = localStorage.getItem('leafletForCycloY');
  //       } else {
  //         app.state.leafletForCycloY = app.default.leafletForCycloY;
  //       }
  //       console.log('still running setInitLocation - about to run openByCoordinate');
  //       app.viewer.openByCoordinate([parseFloat(app.state.leafletForCycloX), parseFloat(app.state.leafletForCycloY)]);
  //       console.log('still running setInitLocation - ran openByCoordinate');
  //     },
  //
  //     didChangeView: function () {
  //       //console.log('VIEW_CHANGE occurred');
  //       //console.log('stViewYaw was ' + app.state.stViewYaw);
  //       //console.log('stViewHfov was ' + app.state.stViewHfov);
  //       app.state.stViewYaw = app.viewer.props.orientation.yaw * (180/3.14159265359);
  //       //console.log('stViewYaw now is ' + app.state.stViewYaw);
  //       app.state.stViewHfov = app.viewer.props.orientation.hFov * (180/3.14159265359);
  //       //console.log('stViewHfov now is ' + app.state.stViewHfov);
  //
  //       // SET LOCAL STORAGE
  //       app.LSsetImageProps();
  //
  //       // CALL CHANGES WITHOUT LOCAL STORAGE
  //       //app.state.stViewConeCoords = app.map.calculateConeCoords();
  //       //app.map.stViewMarkersLayerGroup.clearLayers();
  //       //app.map.drawStViewMarkers();
  //     },
  //
  //     didLoadView: function () {
  //       console.log('VIEW_LOAD_END event fired');
  //       var propsLoc = [app.viewer.props.orientation.xyz[0], app.viewer.props.orientation.xyz[1]];
  //       var savedLoc = [app.state.stViewX, app.state.stViewY];
  //       //console.log(propsLoc);
  //       //console.log(savedLoc);
  //       if (app.viewer.props.orientation.xyz[0] == app.state.stViewX && app.viewer.props.orientation.xyz[1] == app.state.stViewY) {
  //         //console.log('location already saved - VIEW_LOAD_END event did not trigger reload');
  //       } else {
  //         //console.log('saving new location to state');
  //         app.state.stViewX = app.viewer.props.orientation.xyz[0]
  //         app.state.stViewY = app.viewer.props.orientation.xyz[1]
  //         //console.log('saving new location to localStorage');
  //
  //         // SET LOCAL STORAGE
  //         app.LSsetImageProps();
  //
  //         // CALL CHANGES WITHOUT LOCAL STORAGE
  //         //app.state.stViewConeCoords = app.map.calculateConeCoords();
  //         //app.map.drawStViewMarkers();
  //       }
  //     },
  //
  //     setNewLocation: function () {
  //       console.log('running setNewLocation');
  //       app.resolveNewLocation = $.Deferred();
  //       //app.state.clickedOnMap = localStorage.getItem('clickedOnMap');
  //       //if (app.state.clickedOnMap == 'false'){
  //         //console.log('using top cause app.state.clickedOnMap is ', app.state.clickedOnMap);
  //         //console.log(localStorage.getItem('leafletForCycloX'), ' ', localStorage.getItem('leafletForCycloY'));
  //         app.state.leafletForCycloX = localStorage.getItem('leafletForCycloX');
  //         app.state.leafletForCycloY = localStorage.getItem('leafletForCycloY');
  //       //} else {
  //         //console.log('using bottom cause app.state.clickedOnMap is ', app.state.clickedOnMap);
  //         //app.state.leafletForCycloX = localStorage.getItem('circleX');
  //         //app.state.leafletForCycloY = localStorage.getItem('circleY');
  //         app.viewer.openByCoordinate([parseFloat(app.state.leafletForCycloX), parseFloat(app.state.leafletForCycloY)]);
  //       //console.log('finished setNewLocation (ran viewer.openByCoordinate)');
  //     },
  //
  //     LSsetImageProps: function () {
  //       //console.log('running LSsetImageProps');
  //       localStorage.setItem('stViewX', app.state.stViewX);
  //       localStorage.setItem('stViewY', app.state.stViewY);
  //       localStorage.setItem('stViewCoords', [app.state.stViewX, app.state.stViewY]);
  //       localStorage.setItem('stViewYaw', app.state.stViewYaw);
  //       localStorage.setItem('stViewHfov', app.state.stViewHfov);
  //     },


  // var cycloPanel = document.getElementById('container');
  // app.init(cycloPanel);
