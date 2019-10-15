export default {
  watch: {
    activeFeature(nextActiveFeature, prevActiveFeature) {

      const layerMap = this.$store.state.map.map._layers;
      const layers = Object.values(layerMap);
      // console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature, 'layers:', layers);

      let updateFeaturePrev,
        updateFeatureNext,
        tableId,
        featureIdPrev,
        featureIdNext,
        matchingLayerNext,
        matchingLayerPrev;

      if (prevActiveFeature && prevActiveFeature.tableId && prevActiveFeature.featureId) {
        // console.log('prevActiveFeature:', prevActiveFeature);
        updateFeaturePrev = prevActiveFeature;
        tableId = updateFeaturePrev.tableId;
        featureIdPrev = updateFeaturePrev.featureId;
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
        this.updateMarkerStyle(matchingLayerPrev);
      }

      if (nextActiveFeature && nextActiveFeature.tableId && nextActiveFeature.featureId) {
        // console.log('nextActiveFeature:', nextActiveFeature);
        updateFeatureNext = nextActiveFeature;
        tableId = updateFeatureNext.tableId;
        featureIdNext = updateFeatureNext.featureId;
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
        this.updateMarkerStyle(matchingLayerNext);
        this.bringMarkerToFront(matchingLayerNext);
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
      // console.log('markers-mixin.js markersForTopic computed is running');
      const markers = [];

      // marker for topic from config
      const topicMarkers = this.activeTopicConfig.markersForTopic;
      if (topicMarkers) {
        const state = this.$store.state;
        const topicData = topicMarkers.data(state);
        if (topicData !== null) {
          // if (Array.isArray(topicData)) {
          //   for (let marker of topicData) {
          //     console.log('topicData marker:', marker);
          //     // }
          //     // if (path !== null && path !== undefined) {
          //     const latlng = [marker.lat, marker.lng];
          //     const key = marker.key;
          //     const color = marker.color || 'green';
          //     const markerType = 'overlay';
          //     const icon = marker.icon;
          //     const markerObject = {latlng, key, color, markerType, icon};
          //     markers.push(markerObject);
          //   }
          // } else {
          const latlng = [ topicData[topicMarkers.lat], topicData[topicMarkers.lng] ];
          const key = topicData[topicMarkers.key];
          const color = topicMarkers.color || 'green';
          const markerType = 'overlay';
          const icon = topicMarkers.icon;
          const markerObject = { latlng, key, color, markerType, icon };
          markers.push(markerObject);
          // }
        }
      }
      return markers;
    },

    reactiveCircleMarkers() {
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
          props.latlng = latlng;
          props.featureId = item._featureId;
          props.tableId = tableId;
          circleMarkers.push(props);
        }
      }

      return circleMarkers;
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
    },

    leafletMarkers() {
      const markers = [];

      markers.push.apply(markers, this.markers);
      markers.push.apply(markers, this.geojsonParcels);

      return markers;
    },
  },
  methods: {
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
    },
    bringMarkerToFront(circleMarker) {
      if (!circleMarker) {
        return; 
      }
      // put marker on top
      const el = circleMarker._path;

      // remove from parent
      const group = circleMarker._renderer._rootGroup;
      group.removeChild(el);

      // append to end (which brings it to the front)
      group.appendChild(el);
    },
    handleMarkerMouseover(e) {
      // console.log('handleMarkerMouseover is starting');
      if (!this.isMobileOrTablet) {
        // console.log('handleMarkerMouseover actions are running');
        const { target } = e;
        const { featureId, tableId } = target.options.data;
        // console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleMarkerClick(e) {
      // console.log('handleMarkerClick is starting');
      if (this.isMobileOrTablet) {
        // console.log('handleMarkerClick actions are running');
        const { target } = e;
        const { featureId, tableId } = target.options.data;
        // console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
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
      // console.log('updateMarkerStyle, marker:', marker);
      if (!marker) {
        return; 
      }
      // get next fill color
      const { featureId, tableId, type } = marker.options.data;
      const nextStyles = this.styleForOverlayMarker(featureId, tableId);
      const nextFillColor = nextStyles.fillColor;
      const nextWeight = nextStyles.weight;

      // highlight. we're doing this here (non-reactively) because binding the
      // fill color property was not performing well enough.
      const nextStyle = Object.assign({}, marker.options);

      if (type === 'polyline') {
        nextStyle.color = nextFillColor;
        nextStyle.weight = nextWeight;
      } else {
        nextStyle.fillColor = nextFillColor;
      }
      marker.setStyle(nextStyle);
    },
  },
};
