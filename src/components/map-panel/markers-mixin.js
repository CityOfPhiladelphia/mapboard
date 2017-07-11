export default {
  watch: {
    activeFeature(nextActiveFeature) {
      //console.log('watch', nextActiveFeature);
      //console.log(this.circleMarkers);
    }
  },
  computed: {
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
    // returns all geojson features to be rendered on the map along with
    // necessary props.
    circleMarkers() {
      const circleMarkers = [];
      const overlayKeys = this.activeTopicConfig.overlays || [];
      const circleOverlayKeys = overlayKeys.filter(overlayKey => {
        const overlay = this.$config.overlays[overlayKey];
        const options = overlay.options;
        return options && options.marker === 'circle';
      });

      // if active topic has no circle overlays, return
      if (circleOverlayKeys.length === 0) {
        return circleMarkers;
      }

      const sources = this.$store.state.sources;

      // loop over circle overlays
      for (let circleOverlayKey of circleOverlayKeys) {
        const circleOverlay = this.$config.overlays[circleOverlayKey];
        const dataSource = circleOverlay.dataSource
        const options = circleOverlay.options;
        const data = sources[dataSource].data;

        const activeFeature = this.$store.state.activeFeature;

        for (let row of data) {

          const [x, y] = row.geometry.coordinates;
          const latlng = [y, x];

          // check for active feature TODO - bind style props to state
          const style = options.style;
          const props = Object.assign({}, style);
          if (row._featureId === activeFeature) {
            props.fillColor = 'yellow';
            //console.log('inside circleOverlay', circleOverlay);
            //this.bringCircleMarkerToFront(this);
            //props.zIndexOffset = 100;
          }
          props.latlng = latlng;
          props.featureId = row._featureId;
          circleMarkers.push(props);
        }
      }

      return circleMarkers;
    },
    geojsonFeatures() {
      const features = [];

      const identifyFeature = this.identifyFeature;
      const activeParcelLayer = this.activeParcelLayer;
      // pwd parcel
      if (identifyFeature === 'pwd-parcel' && activeParcelLayer === 'pwd' && this.pwdParcel) {
        const geojson = this.pwdParcel;
        const color = 'blue';
        // const overlayFeature = {
        //   type: null,
        //   style: {
        //     color: 'blue'
        //   }
        // };
        const key = geojson.properties.PARCELID;
        features.push({geojson, color, key});
      // dor parcel
      } else if (identifyFeature === 'dor-parcel' && activeParcelLayer === 'dor') {
        // const overlayFeature = {
        //   type: null,
        //   style: {
        //     color: 'green'
        //   }
        // };
        const color = 'green';
        //const type = null;
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
    handleCircleMarkerClick(e) {
      const featureId = e.target.options.data.featureId;
      this.$store.commit('setActiveFeature', featureId);
    },
    bringCircleMarkerToFront(circleMarker) {
      //console.log('bringCircleMarkerToFront', circleMarker);
      // put marker on top
      const el = circleMarker._path;

      // remove from parent
      const group = circleMarker._renderer._rootGroup;
      group.removeChild(el);

      // append to end (which brings it to the front)
      group.appendChild(el);
    },
    handleCircleMarkerMouseover(e) {
      //console.log('handleCircleMarkerMouseover', e);
      const target = e.target;
      const featureId = target.options.data.featureId;
      this.$store.commit('setActiveFeature', featureId);

      // bring to front
      this.bringCircleMarkerToFront(target);
    },
    handleCircleMarkerMouseout(e) {
      this.$store.commit('setActiveFeature', null);
    },
  }
};
