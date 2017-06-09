<script>
  export default {
    props: [
      'orientation'
    ],
    render(h) {
      return;
    },
    computed: {
      ipa() {
        return this.$store.state.pictometry.ipa;
      },
      xy() {
        return [this.$props.orientation[1], this.$props.orientation[0]];
      }
    },
    mounted() {
      this.placeCamera(this.xy);
    },
    beforeDestroy() {
      this.ipa.removeShapes(this.$store.state.pictometry.cameraIds);
    },
    watch: {
      xy(nextOrientation) {
        console.log('camera: xy changed');
        this.ipa.removeShapes(this.$store.state.pictometry.cameraIds);
        this.placeCamera(nextOrientation);
      }
    },
    methods: {
      constructLocalUrl(host, path) {
        return 'http://' + host + path;
      },

      placeCamera: function(nextOrientation){
        const self = this;
        const cameraMarker = {
          type : this.ipa.SHAPE_TYPE.MARKER,
          center: { y: nextOrientation[0], x: nextOrientation[1]},
          markerImageHeight: 20,
          markerImageWidth: 30,
          markerOffsetX: -2,
          markerOffsetY: -2,
          markerImage: this.constructLocalUrl(window.location.hostname, '/pictometry/images/camera.png'),
          onShapeClick: 'true'
        };
        this.ipa.addShapes([cameraMarker], function(result) {
          for ( var i = 0; i < result.length; i++) {
            if ( result[i].success === 'false' ) {
              alert(result[i].error);
            } else {
              const cameraIds = self.$store.state.pictometry.cameraIds;
              cameraIds.push(result[i].shapeId);
            }
          }
        });
      },
    }
  }
</script>
