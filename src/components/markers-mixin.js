export default {
  watch: {

    activeFeature(nextActiveFeature, prevActiveFeature) {

      let layerMap, layers;
      // console.log('watch activeFeature, this.$store.map.getStyle():', this.$store.map.getStyle(), 'this.$store.map:', this.$store.map);
      if (this.mapType === 'leaflet') {
        layerMap = this.$store.state.map.map._layers;
        layers = Object.values(layerMap);
      } else if (this.mapType === 'mapbox') {
        // layerMap = this.$store.map.getStyle().layers;
        // layers = layerMap;
        layers = this.getVisibleMarkers();
      }
      // console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature, 'layers:', layers);

      let updateFeaturePrev,
        updateFeatureNext,
        tableId,
        featureIdPrev,
        featureIdNext,
        matchingLayerNext,
        matchingLayerPrev;

      if (prevActiveFeature && prevActiveFeature.tableId && prevActiveFeature.featureId) {
        // console.log('first if prevActiveFeature:', prevActiveFeature);
        updateFeaturePrev = prevActiveFeature;
        tableId = updateFeaturePrev.tableId;
        featureIdPrev = updateFeaturePrev.featureId;
        if (this.mapType === 'leaflet') {
          matchingLayerPrev = layers.filter(layer => {
            const options = layer.options || {};
            const data = options.data;
            if (!data) {
              return;
            }
            const layerFeatureId = data.featureId;
            const layerTableId = data.tableId;
            return layerFeatureId === featureIdPrev && layerTableId === tableId;
          })[0];
        } else if (this.mapType === 'mapbox') {
          for (let layer of layers) {
            if (layer.attributes.feature.value === featureIdPrev) {
              matchingLayerPrev = {
                options: {
                  data: {
                    featureId: featureIdPrev,
                    tableId: tableId,
                    layer: layer,
                  },
                },
              };
            }
          }
        }
        this.updateMarkerStyle(matchingLayerPrev);
      }

      if (nextActiveFeature && nextActiveFeature.tableId && nextActiveFeature.featureId) {
        // console.log('second if nextActiveFeature:', nextActiveFeature);
        updateFeatureNext = nextActiveFeature;
        tableId = updateFeatureNext.tableId;
        featureIdNext = updateFeatureNext.featureId;
        if (this.mapType === 'leaflet') {
          matchingLayerNext = layers.filter(layer => {
            const options = layer.options || {};
            const data = options.data;
            if (!data) {
              return;
            }
            const layerFeatureId = data.featureId;
            const layerTableId = data.tableId;
            return layerFeatureId === featureIdNext && layerTableId === tableId;
          })[0];
        } else if (this.mapType === 'mapbox') {
          for (let layer of layers) {
            if (layer.attributes.feature.value === featureIdNext) {
              matchingLayerNext = {
                options: {
                  data: {
                    featureId: featureIdNext,
                    tableId: tableId,
                    layer: layer,
                  },
                },
              };
            }
          }
        }
        // console.log('matchingLayerNext:', matchingLayerNext);
        this.updateMarkerStyle(matchingLayerNext);
        if (this.mapType === 'leaflet') {
          this.bringMarkerToFront(matchingLayerNext);
        }
      }

    },
  },
  computed: {
    locationMarker() {
      const latlngArray = [ this.$store.state.map.location.lat, this.$store.state.map.location.lng ];
      const marker = {
        latlng: latlngArray,
        radius: 6,
        fillColor: '#ff3f3f',
        color: '#ff0000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1.0,
      };
      return marker;
    },

    // returns map markers as simple object with a geometry property, key,
    // and optional properties for symbology
    markersForAddress() {
      // console.log('markers-mixin.js markersForAddress computed is running');
      const markers = [];
      // geocoded address marker
      const geocodeGeom = this.geocodeGeom;
      if (this.identifyFeature === 'address-marker' && geocodeGeom) {
        const latlng = [ ...geocodeGeom.coordinates ].reverse();
        const key = this.geocodeResult.properties.street_address;
        const color = '#2176d2';
        const markerType = 'geocode';
        const icon = {
          prefix: 'fas',
          icon: 'map-marker-alt',
          shadow: true,
          size: 50,
        };
        const addressMarker = { latlng, key, color, markerType, icon };
        markers.push(addressMarker);
      }
      return markers;
    },

    markersForTopic() {
      const markers = [];
      // marker for topic from config
      const topicMarkers = this.activeTopicConfig.markersForTopic;
      // console.log('markers-mixin.js markersForTopic computed is running, topicMarkers:', topicMarkers);
      if (topicMarkers && topicMarkers.lat) {
        const state = this.$store.state;
        const topicData = topicMarkers.data(state);
        if (typeof topicData !== 'undefined' && topicData !== null) {
          const latlng = [ topicData[topicMarkers.lat], topicData[topicMarkers.lng] ];
          const key = topicData[topicMarkers.key];
          const color = topicMarkers.color || 'green';
          const markerType = 'overlay';
          const icon = topicMarkers.icon;
          const markerObject = { latlng, key, color, markerType, icon };
          markers.push(markerObject);
        }
      }
      return markers;
    },

    reactiveCircleMarkers() {
      console.log('computed reactiveCircleMarkers, this.createdComplete:', this.createdComplete, 'this.$config:', this.$config);
      if (this.createdComplete) {
        const filteredData = this.$store.state.horizontalTables.filteredData;
        // const filteredData = this.filteredData;
        let circleMarkers = [];

        // get visible tables based on active topic
        const tableIds = this.$store.getters.visibleTableIds;

        // console.log('computed circleMarkers is rerunning, filteredData:', filteredData, 'tableIds:', tableIds);

        for (let tableId of tableIds) {
          const tableConfig = this.getConfigForTable(tableId) || {};
          // console.log('tableId:', tableId, 'tableConfig:', tableConfig);
          const mapOverlay = (tableConfig.options || {}).mapOverlay;

          if (!mapOverlay || mapOverlay.marker !== 'circle') {
            continue;
          }

          const items = filteredData[tableId];

          if (items.length < 1) {
            continue;
          }

          const style = mapOverlay.style;

          // go through rows
          for (let item of items) {
            // console.log('tableId', tableId)
            let latlng;

            // TODO - get geometry field name from config
            if (item.geometry) {
              const [ x, y ] = item.geometry.coordinates;
              latlng = [ y, x ];
            } else if (item.lat) {
              latlng = [ item.lat, item.lng ];
              // if (item.point_x) {
              //   latlng = [item.point_y, item.point_x];
              // } else if (item.geocode_x) {
              //   latlng = [item.geocode_y, item.geocode_x];
              // }
            }

            // check for active feature TODO - bind style props to state
            let props = Object.assign({}, style);
            props.size = 14;
            props.latlng = latlng;
            props.featureId = item._featureId;
            props.tableId = tableId;
            circleMarkers.push(props);
          }
        }

        return circleMarkers;
      }
    },

    // returns geojson parcels to be rendered on the map along with
    // necessary props.
    geojsonParcels() {
      // console.log('markers-mixin.js geojsonParcels computed is running');
      const features = [];

      const identifyFeature = this.identifyFeature;
      const activeParcelLayer = this.activeParcelLayer;

      // TODO - get pwd parcel and dor parcel into the config file
      // pwd parcel
      if (identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && this.pwdParcel) {
        let props = {};
        props.geojson = this.pwdParcel;
        props.color = 'blue';
        props.fillColor = 'blue';
        props.weight = 2;
        props.opacity = 1;
        props.fillOpacity = 0.3;
        props.key = props.geojson.properties.PARCELID;
        features.push(props);

      // dor parcel
      } else if (identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor') {
        const color = 'blue';
        const dorParcelFeatures = this.dorParcels.map(dorParcel => {
          let props = {};
          props.geojson = dorParcel;
          props.color = 'blue';
          props.fillColor = 'blue';
          props.weight = 2;
          props.opacity = 1;
          props.fillOpacity = 0.3;
          props.key = dorParcel.properties.OBJECTID;
          return props;
        });
        features.push.apply(features, dorParcelFeatures);
      }
      return features;
    },

    // returns other geojson from config
    geojsonForTopic() {
      const features = [];
      const topicGeojson = this.activeTopicConfig.geojsonForTopic;
      if (topicGeojson) {
        const state = this.$store.state;
        const topicData = topicGeojson.data(state);
        if (topicData !== null) {
          for (let geojson of topicData) {
            let props = Object.assign({}, topicGeojson.style);
            props.key = geojson[topicGeojson.key];
            props.geojson = geojson;
            features.push(props);
          }
        }
      }
      return features;
    },

    // these polyline features will have mouseover and mouseout events,
    // for highlighting horizontal table rows
    reactivePolylineFeatures() {
      const features = [];

      const filteredData = this.$store.state.horizontalTables.filteredData;
      // get visible tables based on active topic
      const tableIds = this.$store.getters.visibleTableIds;

      for (let tableId of tableIds) {
        const tableConfig = this.getConfigForTable(tableId) || {};
        const mapOverlay = (tableConfig.options || {}).mapOverlay;

        if (!mapOverlay || mapOverlay.marker !== 'polyline') {
          continue;
        }

        const items = filteredData[tableId];

        if (items.length < 1) {
          continue;
        }

        const style = mapOverlay.style;
        // items.push(tableId);

        // console.log('items:', items);
        // go through rows
        for (let item of items) {
          // console.log('item:', item);
          let props = Object.assign({}, style);
          let latlngs = [];
          for (let coord of item.geometry.coordinates) {
            // console.log('coord:', coord, 'coord[0]:', coord[0]);
            latlngs.push([ coord[1], coord[0] ]);
          }

          props.latlngs = latlngs;
          // props.latlngs = item.geometry.coordinates;
          props.key = item.id;
          props.featureId = item._featureId || null;
          props.tableId = tableId;
          // props.tableId = items[items.length-1];
          features.push(props);
        }
      }
      return features;
    },


    // these geojson features will have mouseover and mouseout events,
    // for highlighting horizontal table rows
    reactiveGeojsonFeatures() {
      console.log('computed reactiveGeojsonFeatures, this.createdComplete:', this.createdComplete, 'this.$config:', this.$config);
      if (this.createdComplete) {
        const features = [];

        const filteredData = this.$store.state.horizontalTables.filteredData;
        // get visible tables based on active topic
        const tableIds = this.$store.getters.visibleTableIds;

        for (let tableId of tableIds) {
          const tableConfig = this.getConfigForTable(tableId) || {};
          const mapOverlay = (tableConfig.options || {}).mapOverlay;

          if (!mapOverlay || mapOverlay.marker !== 'geojson') {
            continue;
          }

          const items = filteredData[tableId];

          if (items.length < 1) {
            continue;
          }

          const style = mapOverlay.style;
          items.push(tableId);

          // go through rows
          for (let item of items) {
            let props = Object.assign({}, style);

            props.geojson = item.geometry;
            props.key = item.id;
            props.featureId = item._featureId || null;
            props.tableId = items[items.length-1];
            features.push(props);
          }
        }
        return features;
      }
    },

    leafletMarkers() {
      const markers = [];

      markers.push.apply(markers, this.markers);
      markers.push.apply(markers, this.geojsonParcels);

      return markers;
    },
  },
  methods: {
    intersectRect(r1, r2) {
      // console.log('intersectRect is running, r1:', r1, 'r2:', r2);
      return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
    },

    getVisibleMarkers() {
      // console.log('getVisibleMarkers is running');
      let map = this.$store.map;
      var cc = map.getContainer();
      var els = cc.getElementsByClassName('circle-div');
      var ccRect = cc.getBoundingClientRect();
      var visibles = [];
      for (var i = 0; i < els.length; i++) {
        var el = els.item(i);
        var elRect = el.getBoundingClientRect();
        this.intersectRect(ccRect, elRect) && visibles.push(el);
      }
      if (visibles.length > 0) {
        // console.log('visibles:', visibles);
      }
      return visibles;
    },

    getTableFromComps(comps, tableId) {
      const matchingComps = comps.filter(comp => {
        return (
          comp.type === 'horizontal-table' &&
          comp._id == tableId
        );
      }) || [];
      return matchingComps[0];
    },

    getConfigForTable(tableId) {
      // if (this.$config) {
      const topics = this.$config.topics || [];

      for (let topic of topics) {
        const comps = topic.components || [];

        // try outer comps
        const table = this.getTableFromComps(comps, tableId);

        if (table) {
          return table;
        }

        // try inner comps
        for (let comp of comps) {
          const options = comp.options || {};

          const innerComps = options.components || options.tables || [];

          if (innerComps.length > 0) {
            const innerTable = this.getTableFromComps(innerComps, tableId);
            // console.log('table on 2nd try', innerTable, innerComps);

            if (innerTable) {
              return innerTable;
            }
          }
        }
      }
      // }
    },
    bringMarkerToFront(circleMarker) {
      if (!circleMarker) {
        return;
      }
      // put marker on top
      const el = circleMarker._path;
      console.log('bringMarkerToFront is running, circleMarker:', circleMarker, 'el:', el);

      // remove from parent
      const group = circleMarker._renderer._rootGroup;
      group.removeChild(el);

      // append to end (which brings it to the front)
      group.appendChild(el);
    },
    handleMarkerMouseover(event) {
      // console.log('handleMarkerMouseover is starting, event:', event, 'event.map:', event.map);
      if (!this.isMobileOrTablet) {
        let e, target, featureId, tableId;
        if (this.mapType === 'leaflet') {
          e = event;
          target= e.target;
          featureId = e.target.options.data.featureId;
          tableId = e.target.options.data.tableId;
        } else if (this.mapType === 'mapbox') {
          let map = this.$store.map;
          let features = map.queryRenderedFeatures();
          // console.log('features:', features);
          e = event.component._props;
          featureId = event.component._props.data.featureId;
          tableId = event.component._props.data.tableId;
        }
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleMarkerClick(e) {
      console.log('handleMarkerClick is starting');
      if (this.isMobileOrTablet) {
        // console.log('handleMarkesrClick actions are running');
        const { target } = e;
        const { featureId, tableId } = target.options.data;
        console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleMarkerMouseout(e) {
      // console.log('handleMarkerMouseout is starting');
      // if (!this.isMobileOrTablet) {
      // console.log('handleMarkerMouseout actions are running');
      const { target } = e;
      this.$store.commit('setActiveFeature', null);
      // }
    },
    updateMarkerStyle(marker) {
      if (!marker) {
        return;
      }
      // get next fill color
      const { featureId, tableId, type } = marker.options.data;
      const nextStyles = this.styleForOverlayMarker(featureId, tableId);
      // console.log('updateMarkerStyle, marker:', marker, 'nextStyles:', nextStyles);
      const nextFillColor = nextStyles.fillColor;
      const nextWeight = nextStyles.weight;
      const nextZIndex = nextStyles['z-index'];

      // highlight. we're doing this here (non-reactively) because binding the
      // fill color property was not performing well enough.
      const nextStyle = Object.assign({}, marker.options);

      if (type === 'polyline') {
        nextStyle.color = nextFillColor;
        nextStyle.weight = nextWeight;
      } else {
        nextStyle.fillColor = nextFillColor;
      }

      if (this.mapType === 'leaflet') {
        marker.setStyle(nextStyle);
      } else if (this.mapType === 'mapbox') {
        // console.log('end of updateMarkerStyle, nextStyle:', nextStyle);
        marker.options.data.layer.style['background-color'] = nextStyle.fillColor;
        marker.options.data.layer.style['z-index'] = nextZIndex;
      }
    },
  },
};
