<template>
  <div class="map-container">
    <!-- the leaflet map -->
    <div class="map" ref="map" />
    <!-- container for vue elements wrapping leaflet elements. these aren't
         actually rendered, they just allow us to make the map reactive.
    -->
    <div>
      <slot />
    </div>
  </div>
</template>

<script>
  import { Map } from 'leaflet';
  import bindEvents from './utils/bind-events';

  export default {
    props: [
      'center',
      'zoom',
      'zoomControlPosition',
      'minZoom',
      'maxZoom'
    ],
    mounted() {
      const map = this.$leafletElement = this.createLeafletElement();

      // move zoom control
      map.zoomControl.setPosition(this.$props.zoomControlPosition);

      // put in state
      // REVIEW do we want to do this? is it serializable?
      this.$store.commit('setMap', { map });

      map.setView(this.center,
                  this.zoom);

      // signal children to mount
      for (let child of this.$children) {
        // REVIEW it seems weird to pass children their own props. trying to
        // remember why this was necessary... binding issue?
        child.parentMounted(this, child.$props);
      }

      // bind events
      // TODO bind these lazily based on props
      // http://leafletjs.com/reference.html#map-click
      const events = [
        'click',
        // 'dblclick',
        // 'mousedown',
        // 'mouseup',
        // 'mouseover',
        // 'mouseout',
        // 'mousemove',
        // 'contextmenu',
        // 'focus',
        // 'blur',
        // 'preclick',
        // 'load',
        // 'unload',
        // 'viewreset',
        // 'movestart',
        // 'move',
        'moveend',
        // 'dragstart',
        // 'drag',
        // 'dragend',
        // 'zoomstart',
        'zoomend',
        // 'zoomlevelschange',
        // 'resize',
        // 'autopanstart',
        // 'layeradd',
        // 'layerremove',
        // 'baselayerchange',
        // 'overlayadd',
        // 'overlayremove',
        // 'locationfound',
        // 'locationerror',
        // 'popupopen',
        // 'popupclose'
      ];

      bindEvents(this, this.$leafletElement, events);
    },
    updated() {
      // if bounds updated, then call map.fitBounds()
      //console.log('map updated', this.$children);
      let children = this.$children;
      let a = this.findShapes(children);
      // console.log('a', a);
    },
    computed: {
      bounds() {
        // return bounds based on all map features
        let children = this.$children;
        return children;
      }
    },
    methods: {
      createLeafletElement() {
        const { zoomControlPosition, ...options } = this.$props;
        return new Map(this.$refs.map, options);
      },
      childDidMount(child) {
        child.addTo(this.$leafletElement);
      },
      findShapes(children) {
        return children.filter((child) => {
          return child._name === "<Geojson>" || child._name === "<VectorMarker>"
        });
      }
    }
  };
</script>

<style>
  .map-container {
    height: 100%;
  }
  .map {
    height: 100%;
  }
</style>
