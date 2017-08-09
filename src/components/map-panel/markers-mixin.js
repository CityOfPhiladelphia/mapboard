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
      // filter the array of tables in the state by the activeTopic
      const activeTopicConfig = this.activeTopicConfig;
      const activeTopicKey = activeTopicConfig.key
      const unfiltTables = this.$store.state.tables;
      const tables = unfiltTables.filter(comp => {
        const key = comp.key
        const mapOverlay = comp.mapOverlay
        return (
          key === activeTopicKey &&
          mapOverlay &&
          mapOverlay.marker === 'circle'
        )
      });

      let circleMarkers = [];
      for(let table of tables) {
        const itemsFiltered = table;
        if (itemsFiltered.data.length < 1) {
          // console.log('length is < 1');
          // return circleMarkers;
        } else {
          console.log('CIRCLEMARKERS RECOMPUTED LENGTH IS', itemsFiltered.data.length);
          // go through rows
          for (let row of itemsFiltered.data) {
            let latlng;
            if (row.geometry) {
              const [x, y] = row.geometry.coordinates;
              latlng = [y, x];
            } else {
              latlng = [row.point_y, row.point_x];
            }

            // check for active feature TODO - bind style props to state
            const style = itemsFiltered.mapOverlay.style;
            const hoverStyle = itemsFiltered.mapOverlay.hoverStyle;
            const activeFeature = this.$store.state.activeFeature;
            let props = Object.assign({}, style);
            if (row._featureId === activeFeature) {
              props = Object.assign({}, hoverStyle);
              // props.fillColor = 'yellow';
              //console.log('inside circleOverlay', circleOverlay);
              //this.bringCircleMarkerToFront(this);
              //props.zIndexOffset = 100;
            }
            props.latlng = latlng;
            props.featureId = row._featureId;
            circleMarkers.push(props);
          }
        }
      }
      // circleMarkers = circleMarkers.filter(marker => {
      //   const filteredMarkers = this.$store.state.map.filters
      //   return filteredMarkers.includes(marker.featureId)
      // });
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
    },
    bringCircleMarkerToFront(circleMarker) {
      console.log('bringCircleMarkerToFront', circleMarker);
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
