<!--
  wraps leaflet svg-icons as a vue component
  https://github.com/iatkin/leaflet-svgicon
-->

<script>
  import L from 'leaflet';
  import DivIcon from 'leaflet';
  import SVGIcon from '../../src/util/svg-icon.js';
  import svgIcon from '../../src/util/svg-icon.js';
  import TriangleIcon from '../../src/util/triangleIcon.js';
  import triangleIcon from '../../src/util/triangleIcon.js';

  export default {
    props: [
      'orientation'
    ],
    render(h) {
      const a = this.$props.orientation
      return;
    },
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    updated() {
      // console.log('svgMarker updated fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    destroyed() {
      // console.log('svgMarker destroyed fired, latlng is', this.latlng);
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    computed: {
      latlng() {
        const xyz = this.$props.orientation.xyz;
        return [xyz[1], xyz[0]];
      },
      rotationAngle() {
        return this.$props.orientation.yaw * (180/3.14159265359);
      },
      coneCoords() {
        const hFov = this.$props.orientation.hFov * (180/3.14159265359);
        const scale = 50//options.scale;
        const angle = hFov / 2.0;
        const width = Math.sin(angle*Math.PI/180);
        const length = Math.sqrt(1.0 - width * width);
        const coneCoords = [width*scale, length*scale];
        return coneCoords;
      }
    },
    methods: {
      createLeafletElement() {
        const coneCoords = this.coneCoords;
        const icon = new L.divIcon.svgIcon.triangleIcon({
          iconSize: L.point(this.coneCoords[0], this.coneCoords[1]),
          iconAnchor: [this.coneCoords[0]/2, this.coneCoords[1]],
        });
        return L.marker(this.latlng, {
          icon: icon,
          rotationAngle: this.rotationAngle,
        });
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      },
    }
  };
</script>

<style>
  .svg-icon-noClick-svg {
    pointer-events: none;
  }

  .svg-icon-noClick {
    pointer-events: none;
  }
</style>
