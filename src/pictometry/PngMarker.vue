<script>
  export default {
    props: [
      'icon',
      'latlng',
      'height',
      'width'
    ],
    render(h) {
      return;
    },
    computed: {
      ipa() {
        return this.$store.state.pictometry.ipa;
      },
    },
    mounted() {
      this.placeMarker(this.$props.latlng);
    },
    beforeDestroy() {
      this.ipa.removeShapes(this.$store.state.pictometry.pngMarkerIds);
    },
    watch: {
      latlng(nextLatlng) {
        console.log('PngMarker: latlng changed');
        this.ipa.removeShapes(this.$store.state.pictometry.pngMarkerIds);
        this.placeMarker(nextLatlng);
      }
    },
    methods: {
      constructLocalUrl(host, path1, path2) {
        return 'http://' + host + path1 + path2;
      },

      placeMarker(nextLatlng) {
        console.log('starting placeMarker', nextLatlng, this.$props.icon);
        const self = this;
        const pngMarker = {
          type : this.ipa.SHAPE_TYPE.MARKER,
          center: { y: nextLatlng[0], x: nextLatlng[1]},
          markerImageHeight: this.$props.height,
          markerImageWidth: this.$props.width,
          markerOffsetX: this.$props.offsetX,
          markerOffsetY: this.$props.offsetY,
          markerImage: this.constructLocalUrl(window.location.hostname, ':8080/src/assets/', this.$props.icon),
          onShapeClick: 'true'
        };
        console.log('pngMarker', pngMarker)
        this.ipa.addShapes([pngMarker], function(result) {
          console.log('result', result);
          for ( var i = 0; i < result.length; i++) {
            if ( result[i].success === 'false' ) {
              alert(result[i].error);
            } else {
              const pngMarkerIds = self.$store.state.pictometry.pngMarkerIds;
              console.log('pngMarkerIds', pngMarkerIds);
              pngMarkerIds.push(result[i].shapeId);
            }
          }
        });
      },
    }
  }
</script>
