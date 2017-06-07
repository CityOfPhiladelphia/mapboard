export default {
  computed: {
    isGeocoding() {
      return this.$store.state.geocode.status === 'waiting';
    },
  },
  methods: {
    getReverseGeocode(latlng) {
      const lnglat = [latlng.lng, latlng.lat];
      const url = this.$config.geocoder.methods.reverseGeocode.url(lnglat);
      this.$http.get(url.replace('ais', 'ais_test')).then(response => {
        const data = response.body;
        this.$store.commit('setGeocodeData', data.features[0])
      }, response => {
        console.log('reverse geocode error')
      });
    },
    getPwdParcelByLatLng(latlng) {
      const url = this.$config.map.featureLayers.pwdParcels.url;
      const parcelQuery = L.esri.query({ url });
      parcelQuery.contains(latlng);
      parcelQuery.run(this.didGetPwdParcel);
    },
    getPwdParcelById(id) {
      const url = this.$config.map.featureLayers.pwdParcels.url;
      const parcelQuery = L.esri.query({ url });
      parcelQuery.where('PARCELID = ' + id);
      parcelQuery.run(this.didGetPwdParcel);
    },
    didGetPwdParcel(error, featureCollection, response) {
      // console.log('did get pwd parcel', featureCollection);

      if (error) {
        console.warn('did get pwd parcel error', error);
        return;
      }
      if (!featureCollection) {
        console.warn('did get pwd parcel, but no features');
        return;
      }
      const features = featureCollection.features;
      let feature;
      if (features.length === 0) {
        feature = null;
      } else {
        feature = features[0]
        // this shouldn't happen
        if (features.length > 1) {
          console.debug('got more than one pwd parcel', features);
        }
      }
      this.$store.commit('setPwdParcel', feature);

      const shouldGeocode = (
        this.activeParcelLayer === 'pwd' &&
        feature &&
        this.$store.state.lastSearchMethod === 'reverseGeocode'
      );
      // console.log('pwd shouldGeocode', shouldGeocode);
      if (shouldGeocode) {
        this.geocode(feature.properties.PARCELID);
      } else {
        this.fetchData();
      }
    },
    getDorParcelsByLatLng(latlng) {
      const url = this.$config.map.featureLayers.dorParcels.url;
      const parcelQuery = L.esri.query({ url });
      parcelQuery.contains(latlng);
      parcelQuery.run(this.didGetDorParcels);
    },
    getDorParcelsById(id) {
      const url = this.$config.map.featureLayers.dorParcels.url;
      const parcelQuery = L.esri.query({ url });
      parcelQuery.where("MAPREG = '" + id + "'")
      parcelQuery.run(this.didGetDorParcels);
    },
    didGetDorParcels(error, featureCollection, response) {
      // console.log('did get dor parcels', featureCollection);

      if (error) {
        console.warn('did get dor parcels error', error);
        return;
      }
      if (!featureCollection) {
        console.warn('did get dor parcels, but no features');
        return;
      }
      const features = featureCollection.features;
      this.$store.commit('setDorParcels', featureCollection.features);

      const shouldGeocode = (
        this.activeParcelLayer === 'dor' &&
        //features.length < 1 &&
        // features.length < 1 &&
        this.$store.state.lastSearchMethod === 'reverseGeocode'
      );
      // console.log('dor shouldGeocode', shouldGeocode);
      if (shouldGeocode) {
        // TODO sort by mapreg, status
        this.geocode(features[0].properties.MAPREG);
      } else {
        this.fetchData();
      }
    },
    geocode(input) {
      // console.log('geocode', input);

      const self = this;
      const searchConfig = this.$config.geocoder.methods.search;
      const url = searchConfig.url(input);
      const params = searchConfig.params;

      // set status of geocode
      this.$store.commit('setGeocodeStatus', 'waiting');

      this.$http.get(url, { params }).then(this.didGeocode, response => {
        console.log('geocode error')
        self.$store.commit('setGeocodeData', null);
        self.$store.commit('setGeocodeStatus', 'error');
      });
    },
    didGeocode(response) {
      const data = response.body;
      // TODO handle multiple results

      if (!data.features || data.features.length < 1) {
        console.log('geocode got no features', data);
        return;
      }

      // TODO do some checking here
      const feature = data.features[0];
      this.$store.commit('setGeocodeData', feature);
      this.$store.commit('setGeocodeStatus', 'success');

      // send geocode result event to host
      this.$eventBus.$emit('geocodeResult', feature);

      // check for parcels
      // const dorParcels = this.$store.state.dorParcels;
      // const pwdParcel = this.$store.state.pwdParcel;
      // if (!(dorParcels.length > 0 || pwdParcel)) {

      // if this is the result of a search (from the search box), get
      // parcels
      const lastSearchMethod = this.$store.state.lastSearchMethod;
      if (lastSearchMethod === 'geocode') {
        const dorParcelId = feature.properties.dor_parcel_id;
        const pwdParcelId = feature.properties.pwd_parcel_id;
        this.getDorParcelsById(dorParcelId);
        this.getPwdParcelById(pwdParcelId);
      }

      // clear out address-specific state
      this.resetData();

      // fetch data from ready sources
      this.fetchData();

      // pan and center map
      // TODO ideally the map should fit its bounds to the combined extent
      // of markers/other content, reactively
      const map = this.$store.state.map.map;
      const [x, y] = feature.geometry.coordinates;
      map.setView([y, x]);
    }
  }
};
