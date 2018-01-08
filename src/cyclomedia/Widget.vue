<template>
  <div id="cyclo-container"
       :class="this.cycloContainerClass"
  >
  <!-- v-once -->
    <div id="inCycloDiv"
         @click="this.popoutClicked"
         :style="{ right: popoutPosition }"
    >
      <i class="fa fa-external-link fa popout-icon"></i>
    </div>
    <div id="cycloviewer"
         ref="cycloviewer"
         class="panoramaViewerWindow"
    >
    <!-- @mousedown="console.log('mouseup')" -->
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        'docWidth': 0,
        'divWidth': 0,
        'popoutPosition': 0,
      }
    },
    computed: {
      cyclomediaActive() {
        return this.$store.state.cyclomedia.active;
      },
      pictometryActive() {
        return this.$store.state.pictometry.active;
      },
      cycloContainerClass() {
        if (this.pictometryActive) {
          return 'large-16 columns mb-panel'
        } else {
          return 'large-24 columns mb-panel'
        }
      },
      locForCyclo() {
        // console.log('computing locForCyclo');
        const geocodeData = this.$store.state.geocode.data;
        const map = this.$store.state.map.map;
        if (geocodeData) {
          return [geocodeData.geometry.coordinates[1], geocodeData.geometry.coordinates[0]];
        }
      },
      latLngFromMap() {
        return this.$store.state.cyclomedia.latLngFromMap;
      },
      mapCenter() {
        return this.$store.state.map.center;
      },
      navBarOpen() {
        return this.$store.state.cyclomedia.navBarOpen;
      },
      // docWidthComp() {
      //   return $(document).width();
      // }
    },
    watch: {
      locForCyclo(newCoords) {
        console.log('watch locForCyclo is firing, setNewLocation running with newCoords:', newCoords);
        this.setNewLocation(newCoords);
      },
      latLngFromMap(newCoords) {
        console.log('watch latLngFromMap is firing, setNewLocation running with newCoords:', newCoords);
        this.setNewLocation([newCoords.lat, newCoords.lng]);
      },
      // docWidthComp() {
      //   console.log('docWidth changed');
      // }
      cyclomediaActive() {
        this.setDivWidth();
      },
      // pictometryActive() {
      //   this.setDivWidth();
      // }
    },
    mounted() {
      StreetSmartApi.init({
        targetElement: this.$refs.cycloviewer,
        username: this.$config.cyclomedia.username,
        password: this.$config.cyclomedia.password,
        apiKey: this.$config.cyclomedia.apiKey,
        srs: 'EPSG:4326',
        locale: 'en-us',
        addressSettings: {
          locale: 'en-us',
          database: 'CMDatabase'
        }
      }).then (
        () => {
          // get map center and set location
          const map = this.$store.state.map;
          console.log('mounted is calling setNewLocation, map.center:', map.center);
          this.setNewLocation([map.center[1], map.center[0]]);
        },
        err => {
          // console.log('Api: init: failed. Error: ', err);
        }
      );
      window.addEventListener('resize', this.setDivWidth);
    },
    updated() {
      console.log('cyclomedia updated running');
      // TODO find a better way to get the image to update and not be stretched
      // const viewer = this.$store.state.cyclomedia.viewer;
      if (this.cyclomediaActive) {
        if (window.panoramaViewer) {
          window.panoramaViewer.rotateRight(0.0000001);
        }
      }
      this.setDivWidth();
    },
    methods: {
      setDivWidth() {
        const docWidth = $(document).width();
        this.docWidth = docWidth;
        const el = document.getElementById('cyclo-container');
        const divStyle = window.getComputedStyle(el);
        const divWidth = parseFloat(divStyle.getPropertyValue('width').replace('px', ''));
        this.divWidth = divWidth;
        console.log('setDivWidth is running, docWidth:', docWidth, 'divWidth', divWidth);
        this.popoutPosition = docWidth - (docWidth/2 + divWidth) + 'px';
        // return width;
      },
      setNewLocation(coords) {
        console.log('setNewLocation is running using', coords);
        const viewerType = StreetSmartApi.ViewerType.PANORAMA;
        // StreetSmartApi.open(center.lng + ',' + center.lat, {
        StreetSmartApi.open(coords[1] + ',' + coords[0], {
          viewerType: viewerType,
          srs: 'EPSG:4326',
          closable: false,
          maximizable: false,
        }).then (
          function(result) {
            // console.log('StreetSmartApi2, result:', result);
            const widget = this;
            // console.log('Created component through API:', result);
            if (result) {
              for (let i =0; i < result.length; i++) {
                if(result[i].getType() === StreetSmartApi.ViewerType.PANORAMA) window.panoramaViewer = result[i];
              }
              widget.sendOrientationToStore();
              window.panoramaViewer.toggleNavbarExpanded(widget.navBarOpen);

              window.panoramaViewer.on('VIEW_CHANGE', function() {
                if (window.panoramaViewer.props.orientation.yaw !== widget.$store.state.cyclomedia.orientation.yaw ||
                    window.panoramaViewer.props.orientation.xyz !== widget.$store.state.cyclomedia.orientation.xyz
                ) {
                  // console.log('on VIEW_CHANGE fired with yaw change', window.panoramaViewer.props.orientation);
                  widget.sendOrientationToStore();
                } else if (window.panoramaViewer.getNavbarExpanded() !== this.navBarOpen) {
                  widget.$store.commit('setCyclomediaNavBarOpen', window.panoramaViewer.getNavbarExpanded());
                }
              })
            }
          }.bind(this)
        ).catch(
          function(reason) {
            // console.log('Failed to create component(s) through API: ' + reason);
          }
        );

        // const viewer = this.$store.state.cyclomedia.viewer;
        // viewer.openByCoordinate(coords);
      },
      sendOrientationToStore() {
        // console.log('sendOrientationToStore, yaw:', window.panoramaViewer.props.orientation.yaw);
        this.$store.commit('setCyclomediaYaw', window.panoramaViewer.props.orientation.yaw)
        this.$store.commit('setCyclomediaHFov', window.panoramaViewer.props.orientation.hFov)
        this.$store.commit('setCyclomediaXyz', window.panoramaViewer.props.orientation.xyz)
      },
      popoutClicked() {
        const map = this.$store.state.map.map;
        const center = map.getCenter();
        window.open('//cyclomedia.phila.gov/?' + center.lat + '&' + center.lng, '_blank');
        this.$store.commit('setCyclomediaActive', false);
      }
    }
  };
</script>

<style>

#cyclo-container {
  padding: 0px;
  height: 50%;
}

#inCycloDiv {
  /* position: absolute; */
  position: absolute;
  /* top: 0px; */
  right: 0px;
  /* float: right; */
  background-color: white;
  border: 0px solid;
  width: 30px;
  height: 30px;
  cursor:pointer;
  z-index: 10;
}

.popout-icon {
  margin-top: 8.5px;
  font-size: 15px;
  margin-left: 8.5px;
}

.panoramaViewerWindow {
  display: block;
  width: 100%;
  height:100%;
}

</style>
