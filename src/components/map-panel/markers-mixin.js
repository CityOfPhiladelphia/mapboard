export default {
  watch: {
    activeFeature(nextActiveFeature, prevActiveFeature) {
      // console.log('WATCH active feature', prevActiveFeature, '=>', nextActiveFeature);

      let updateFeature;

      if (nextActiveFeature && nextActiveFeature.tableId && nextActiveFeature.featureId) {
        updateFeature = nextActiveFeature;
      } else {
        updateFeature = prevActiveFeature;
      }

      const featureId = updateFeature.featureId;
      const tableId = updateFeature.tableId;

      // get marker
      const layerMap = this.$store.state.map.map._layers;
      const layers = Object.values(layerMap);

      const matchingLayer = layers.filter(layer => {
        const options = layer.options || {};
        const data = options.data;

        if (!data) return;

        const layerFeatureId = data.featureId;
        const layerTableId = data.tableId;

        return layerFeatureId === featureId && layerTableId === tableId;
      })[0];


      // if (!matchingLayer) return;

      this.updateCircleMarkerFillColor(matchingLayer);

      // bring to front
      this.bringCircleMarkerToFront(matchingLayer);
    },
  },
  computed: {
    locationMarker() {
      const latlngArray = [this.$store.state.map.location.lat, this.$store.state.map.location.lng]
      const marker = {
        latlng: latlngArray,
        radius: 6,
        fillColor: '#ff3f3f',
        color: '#ff0000',
        weight: 1,
        opacity: 1,
        fillOpacity: 1.0
      }
      return marker;
    },
    // returns map markers as simple object with a geometry property, key,
    // and optional properties for symbology
    markers() {
      const markers = [];

      // geocoded address marker
      const geocodeGeom = this.geocodeGeom;
      if (this.identifyFeature === 'address-marker' && geocodeGeom) {
        const latlng = [...geocodeGeom.coordinates].reverse();
        const key = this.geocodeResult.properties.street_address;
        const addressMarker = {latlng, key};
        markers.push(addressMarker);
      }

      return markers;
    },
    circleMarkers() {
      const filteredData = this.$store.state.tables.filteredData;
      let circleMarkers = [];

      // get visible tables based on active topic
      const tableIds = this.$store.getters.visibleTableIds;

      for (let tableId of tableIds) {
        const tableConfig = this.getConfigForTable(tableId) || {};
        const mapOverlay = (tableConfig.options || {}).mapOverlay;

        if (!mapOverlay) {
          continue;
        }

        const items = filteredData[tableId];

        if (items.length < 1) {
          continue;
        }

        const style = mapOverlay.style;

        // go through rows
        for (let item of items) {
          let latlng;

          // TODO - get geometry field name from config
          if (item.geometry) {
            const [x, y] = item.geometry.coordinates;
            latlng = [y, x];
          } else if (item.lat) {
            latlng = [item.lat, item.lng]
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

    // returns all geojson features to be rendered on the map along with
    // necessary props.
    geojsonFeatures() {
      const features = [];

      const identifyFeature = this.identifyFeature;
      const activeParcelLayer = this.activeParcelLayer;
      // pwd parcel
      if (identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && this.pwdParcel) {
        const geojson = this.pwdParcel;
        const color = 'blue';
        const key = geojson.properties.PARCELID;

        features.push({geojson, color, key});
      // dor parcel
      } else if (identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor') {
        const color = 'blue';
        const dorParcelFeatures = this.dorParcels.map(dorParcel => {
          const geojson = dorParcel;
          const key = geojson.properties.OBJECTID;
          return {geojson, color, key};
        });
        features.push.apply(features, dorParcelFeatures);
      }

      // GeoJSON overlays
      // const stateSources = this.$store.state.sources;
      // const dataSourcesConfig = this.$config.dataSources;
      //
      // // step through the (possibly multiple) datasources for the active topic
      // for (let dataSource of this.activeTopicConfig.dataSources) {
      //   // filter datasources with format geojson
      //   if (dataSourcesConfig[dataSource].format === 'geojson') {
      //     // step through to add each geojson object to "features"
      //     for (let geojson of stateSources[dataSource].data) {
      //       let overlayFeature = this.activeTopicConfig.overlayFeature;
      //       let key = geojson.id;
      //       features.push({geojson, overlayFeature, key});
      //     }
      //   }
      // }
      // TODO filter by selected 311, police
      return features;
    },
    leafletMarkers() {
      const markers = [];

      markers.push.apply(markers, this.markers);
      markers.push.apply(markers, this.geojsonFeatures);

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

        if (table) return table;

        // try inner comps
        for (let comp of comps) {
          const options = comp.options || {};

          const innerComps = options.components || [];

          if (innerComps.length > 0) {
            const innerTable = this.getTableFromComps(innerComps, tableId);
            // console.log('table on 2nd try', innerTable, innerComps);

            if (innerTable) return innerTable;
          }
        }
      }
    },
    bringCircleMarkerToFront(circleMarker) {
      // put marker on top
      const el = circleMarker._path;

      // remove from parent
      const group = circleMarker._renderer._rootGroup;
      group.removeChild(el);

      // append to end (which brings it to the front)
      group.appendChild(el);
    },
    handleCircleMarkerMouseover(e) {
      console.log('handleCircleMarkerMouseover is starting');
      if (!this.isMobileOrTablet) {
        console.log('handleCircleMarkerMouseover actions are running');
        const { target } = e;
        const { featureId, tableId } = target.options.data;
        console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleCircleMarkerClick(e) {
      console.log('handleCircleMarkerClick is starting');
      if (this.isMobileOrTablet) {
        console.log('handleCircleMarkerClick actions are running');
        const { target } = e;
        const { featureId, tableId } = target.options.data;
        console.log('target:', target, 'featureId:', featureId, 'tableId:', tableId);
        this.$store.commit('setActiveFeature', { featureId, tableId });
      }
    },
    handleCircleMarkerMouseout(e) {
      console.log('handleCircleMarkerMouseout is starting');
      // if (!this.isMobileOrTablet) {
        console.log('handleCircleMarkerMouseout actions are running');
        const { target } = e;
        this.$store.commit('setActiveFeature', null);
      // }
    },
    updateCircleMarkerFillColor(marker) {
      // get next fill color
      const { featureId, tableId } = marker.options.data;
      const nextFillColor = this.fillColorForCircleMarker(featureId, tableId);

      // highlight. we're doing this here (non-reactively) because binding the
      // fill color property was not performing well enough.
      const nextStyle = Object.assign({}, marker.options);
      nextStyle.fillColor = nextFillColor;
      marker.setStyle(nextStyle);
    },
  }
};
