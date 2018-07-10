(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('leaflet')) :
  typeof define === 'function' && define.amd ? define(['exports', 'leaflet'], factory) :
  (factory((global.vueleafletesri = {}),global.L));
}(this, (function (exports,L) { 'use strict';

  // inspired by https://github.com/KoRiGaN/Vue2Leaflet/blob/master/src/utils/eventsBinder.js
  function bindEvents(vue, leafletElement, events) {
    // get just leaflet events
    var leafletEvents = Object.keys(events)
                                .filter(function (eventName) {
                                  return eventName.startsWith('l-');
                                })
                                .map(function (eventName) { return eventName.slice(2); });

    var loop = function () {
      var leafletEvent = list[i];

      var vueEvent = 'l-' + leafletEvent;
      leafletElement.on(leafletEvent, function (e) {
        vue.$emit(vueEvent, e);
      });
    };

    for (var i = 0, list = leafletEvents; i < list.length; i += 1) loop();
  }

  function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
  (function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=" .map-container { height: 100%; } .map { height: 100%; } @media (max-width: 749px) { .map { height: 300px; } } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

  var Map_ = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"map-container"},[_c('div',{ref:"map",staticClass:"map"}),_vm._v(" "),_c('div',[_vm._t("default")],2)])},staticRenderFns: [],
    props: [
      'center',
      'zoom',
      'zoomControlPosition',
      'minZoom',
      'maxZoom' ],
    computed: {
      fullScreenMapEnabled: function fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      mapBounds: function mapBounds() {
        return this.$store.state.map.bounds;
      }
    },
    watch: {
      center: function center(nextCenter) {
        this.setMapView(nextCenter);
      },
      zoom: function zoom(nextZoom) {
        if (!nextZoom) { return; }

        this.$leafletElement.setZoom(nextZoom);
      },
      mapBounds: function mapBounds(nextBounds) {
        this.setMapBounds(nextBounds);
      },
      fullScreenMapEnabled: function fullScreenMapEnabled() {
        console.log('Map.vue fullScreenMapEnabled watch is firing');
        this.$leafletElement.invalidateSize();
      }
    },
    mounted: function mounted() {
      var this$1 = this;

      var map = this.$leafletElement = this.createLeafletElement();

      // move zoom control
      map.zoomControl.setPosition(this.$props.zoomControlPosition);

      // put in state
      // REVIEW do we want to do this? is it serializable?
      this.$store.commit('setMap', { map: map });

      this.setMapView(this.center);

      this.$nextTick(function () {
        map.attributionControl.setPrefix('<a target="_blank" href="//www.phila.gov/it/aboutus/units/Pages/GISServicesGroup.aspx">City of Philadelphia | CityGeo</a>');
      });

      // signal children to mount
      for (var i = 0, list = this$1.$children; i < list.length; i += 1) {
        // REVIEW it seems weird to pass children their own props. trying to
        // remember why this was necessary... binding issue?
        var child = list[i];

        child.parentMounted(this$1, child.$props);
      }

      // bind events
      // http://leafletjs.com/reference.html#map-click

      // const MAP_EVENTS = [
      //   'click',
      //   'dblclick',
      //   'mousedown',
      //   'mouseup',
      //   'mouseover',
      //   'mouseout',
      //   'mousemove',
      //   'contextmenu',
      //   'focus',
      //   'blur',
      //   'preclick',
      //   'load',
      //   'unload',
      //   'viewreset',
      //   'movestart',
      //   'move',
      //   'moveend',
      //   'dragstart',
      //   'drag',
      //   'dragend',
      //   'zoomstart',
      //   'zoomend',
      //   'zoomlevelschange',
      //   'resize',
      //   'autopanstart',
      //   'layeradd',
      //   'layerremove',
      //   'baselayerchange',
      //   'overlayadd',
      //   'overlayremove',
      //   'locationfound',
      //   'locationerror',
      //   'popupopen',
      //   'popupclose'
      // ];

      // TODO warn if trying to bind an event that doesn't exist
      bindEvents(this, this.$leafletElement, this._events);
    },
    // updated(next, prev) {
    //   const markers = this.getMarkers();
    //   if (markers.length === 0) return;
    //   const latlngs = markers.map(marker => marker.getLatLng());
    //   console.log('updated', markers);
    //   const latLngBounds = new LatLngBounds(latlngs);
    //   console.log('llb', latLngBounds);
    //   this.$leafletElement.fitBounds(latLngBounds);
    // },
    methods: {
      createLeafletElement: function createLeafletElement() {
        var ref = this.$props;
        var zoomControlPosition = ref.zoomControlPosition;
        var rest = objectWithoutProperties( ref, ["zoomControlPosition"] );
        var options = rest;
        return new L.Map(this.$refs.map, options);
      },
      childDidMount: function childDidMount(child) {
        child.addTo(this.$leafletElement);
      },
      setMapView: function setMapView(xy, zoom) {
        var this$1 = this;
        if ( xy === void 0 ) xy = [];
        if ( zoom === void 0 ) zoom = this.zoom;

        if (xy.length === 0) { return; }
        var lng = xy[0];
        var lat = xy[1];
        var latLng = new L.LatLng(lat, lng);

        // we used "setView" here because when you refreshed the app with an address in the url,
        // "panTo" was getting stepped on by "setZoom" and it was not happening
        this.$nextTick(function () {
          this$1.$leafletElement.setView(latLng, zoom);
        });
      },
      setMapBounds: function setMapBounds(bounds) {
        if (bounds._northEast) {
          console.log('MAP.VUE SETMAPBOUNDS IS RUNNING:', bounds._northEast.lat, bounds._northEast.lng, bounds._southWest.lat, bounds._southWest.lng);
          this.$leafletElement.fitBounds(bounds);
        }
      }
      // getMarkers() {
      //   const children = this.$children;
      //   const MARKER_CLASSES = [
      //     '<Geojson>',
      //     '<VectorMarker>',
      //   ];
      //   const markers = children.filter(child => {
      //     const name = child._name;
      //     return MARKER_CLASSES.includes(name);
      //   });
      //   return markers.map(marker => marker.$leafletElement);
      // },
      // refit() {
      //   const markers = this.getMarkers();
      //   if (markers.length === 0) return;
      //   const latlngs = markers.map(marker => marker.getLatLng());
      //   console.log('updated', markers);
      //   const latLngBounds = new LatLngBounds(latlngs);
      //   console.log('llb', latLngBounds);
      //   this.$leafletElement.fitBounds(latLngBounds);
      // }
    }
  };

  (function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

  var Control = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._t("default")],2)},staticRenderFns: [],
    props: ['position'],
    methods: {
      createLeafletElement: function createLeafletElement(L$$1) {
        // console.log('Control.vue createLeafletElement is running')
        // subclass Control to accept an el which gets mounted to the map
        var ControlParent = (function (superclass) {
          function ControlParent(el, options) {
            superclass.call(this, options);
            this.el = el;
          }

          if ( superclass ) ControlParent.__proto__ = superclass;
          ControlParent.prototype = Object.create( superclass && superclass.prototype );
          ControlParent.prototype.constructor = ControlParent;
          ControlParent.prototype.onAdd = function onAdd () {
            var el = this.el;

            // keep clicks from hitting the map
            L$$1.DomEvent.disableClickPropagation(el);
            L$$1.DomEvent.disableScrollPropagation(el);

            return el;
          };

          return ControlParent;
        }(L$$1.Control));

        var el = this.$el;
        // console.log('Control.vue el:', el);
        return new ControlParent(el, {
          position: this.position
        });
      },
      parentMounted: function parentMounted(parent, props) {
        // console.log('Control.vue parentMounted is running, parent:', parent, 'props:', props);
        var leafletElement = this.createLeafletElement(L);
        this.$leafletElement = leafletElement;
        var map = parent.$leafletElement;
        // console.log('Control.vue parentMounted is calling addTo(map)');
        leafletElement.addTo(map);
      }
    }
  };

  function objectWithoutProperties$1 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
  (function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=""; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

  // pascal case
  var GeoJson = L.geoJSON;

  var Geojson = {
    props: [
      'geojson',
      'fillColor',
      'color',
      'weight',
      'opacity',
      'fillOpacity',
      'data'
    ],
    mounted: function mounted() {
      var leafletElement = this.$leafletElement = this.createLeafletElement();
      var map = this.$store.state.map.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }

      bindEvents(this, this.$leafletElement, this._events);
    },
    destroyed: function destroyed() {
      this.$leafletElement._map.removeLayer(this.$leafletElement);
    },
    // we don't actually render anything, but need to define either a template
    // or a render function
    render: function render(h) {
      return;
    },
    methods: {
      createLeafletElement: function createLeafletElement() {
        var props = this.$props;
        var geojson = props.geojson;
        var rest = objectWithoutProperties$1( props, ["geojson"] );
        var options = rest;

        // console.log('geojson', geojson)
        var newGeojson = new GeoJson(geojson, options);
        //this.$store.commit('setCircleMarkers', newCircleMarker);
        return newGeojson;
        // if the geoJSON feature is a point, it needs to be styled through "pointToLayer"
        // const type = this.$props.overlay.type;
        // const style = this.$props.overlay.style;
        // return new GeoJson(this.$props.geojson, {
        //   color: this.$props.color,
        //   weight: this.$props.weight,
        //   // pointToLayer: function (feature, latlng) {
      	// 	// 	return type(latlng, style)
        //   // }
        // });
      },
      parentMounted: function parentMounted(parent) {
        var map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      }
    }
  };

  // console.log('Map_', Map_);
  exports.Map_ = Map_;
  exports.Control = Control;
  exports.Geojson = Geojson;
  // exports.CircleMarker = import CircleMarker from '/leaflet/CircleMarker.vue';
  // exports.ControlCorner = import ControlCorner from '/leaflet/ControlCorner.vue';
  //
  // exports.EsriTiledMapLayer = import EsriTiledMapLayer from 'esri-leaflet/TiledMapLayer.vue';
  // exports.EsriTiledOverlay = import EsriTiledOverlay from 'esri-leaflet/TiledOverlay.vue';
  // exports.EsriDynamicMapLayer = import EsriDynamicMapLayer from 'esri-leaflet/DynamicMapLayer.vue';
  // exports.EsriFeatureLayer = import EsriFeatureLayer from '/esri-leaflet/FeatureLayer.vue';
  //
  // exports.AddressInput = import AddressInput from 'components/AddressInput.vue';
  // exports.AddressCandidateList = import AddressCandidateList from 'components/AddressCandidateList.vue';
  // exports.OpacitySlider = import OpacitySlider from 'components/OpacitySlider.vue';
  // exports.VectorMarker = import VectorMarker from 'components/VectorMarker.vue';
  // exports.PngMarker = import PngMarker from 'components/PngMarker.vue';
  // exports.BasemapToggleControl = import BasemapToggleControl from 'components/BasemapToggleControl.vue';
  // exports.BasemapSelectControl = import BasemapSelectControl from 'components/BasemapSelectControl.vue';
  // exports.FullScreenMapToggleTab = import FullScreenMapToggleTab from 'components/FullScreenMapToggleTab.vue';
  // exports.LocationControl = import LocationControl from 'components/LocationControl.vue';
  // exports.MeasureControl = import MeasureControl from 'components/MeasureControl.vue';
  // exports.LegendControl = import LegendControl from 'components/LegendControl.vue';
  // exports.BasemapTooltip = import BasemapTooltip from 'components/BasemapTooltip.vue';
  //
  // exports.CyclomediaButton = import CyclomediaButton from '/cyclomedia/Button.vue';
  // exports.CyclomediaRecordingCircle = import CyclomediaRecordingCircle from '/cyclomedia/RecordingCircle.vue';
  // exports.CyclomediaRecordingsClient = import CyclomediaRecordingsClient from '/cyclomedia/recordings-client';
  // exports.SvgViewConeMarker = import SvgViewConeMarker from '/cyclomedia/SvgViewConeMarker.vue';
  //
  // exports.PictometryButton = import PictometryButton from '/pictometry/Button.vue';

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vue-leaflet-esri.js.map
