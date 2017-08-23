import axios from 'axios';
import BaseClient from './base-client';

// the high-level purpose of this is: take an address, geocode it, and put
// the result in state.
class GeocodeClient extends BaseClient {
  // constructor(opts) {
  //   this.config = opts.config;
  //   this.store = opts.store;
  // }
  fetch(input) {
    const geocodeConfig = this.config.geocoder.forward;
    const url = geocodeConfig.url(input);
    const params = geocodeConfig.params;

    // update state
    this.store.commit('setGeocodeStatus', 'waiting');
    // console.log('GEOCODE CLIENT setting last search method to geocode');
    // this.store.commit('setLastSearchMethod', 'geocode');

    const success = this.success.bind(this);
    const error = this.error.bind(this);

    // return a promise that can accept further chaining
    return axios.get(url, { params })
      .then(success)
      .catch(error);
  }

  success(response) {
    // console.log('geocode success', response);

    const store = this.store;
    const data = response.data;

    // TODO handle multiple results

    if (!data.features || data.features.length < 1) {
      console.log('geocode got no features', data);
      return;
    }

    // TODO do some checking here
    const feature = data.features[0];
    store.commit('setGeocodeData', feature);
    store.commit('setGeocodeStatus', 'success');

    return feature;

    // // everything after this point can go somewhere else
    //
    // // send geocode result event to host
    // this.eventBus.$emit('geocodeResult', feature);
    //
    // // check for parcels
    // // const dorParcels = this.$store.state.dorParcels;
    // // const pwdParcel = this.$store.state.pwdParcel;
    // // if (!(dorParcels.length > 0 || pwdParcel)) {
    //
    // // if this is the result of a search (from the search box), get
    // // parcels
    // const lastSearchMethod = this.$store.state.lastSearchMethod;
    // if (lastSearchMethod === 'geocode') {
    //   const dorParcelId = feature.properties.dor_parcel_id;
    //   const pwdParcelId = feature.properties.pwd_parcel_id;
    //   this.getDorParcelsById(dorParcelId);
    //   this.getPwdParcelById(pwdParcelId);
    // }
    //
    // // clear out address-specific state
    // this.resetData();
    //
    // // fetch data from ready sources
    // this.fetchData();
    //
    // // pan and center map
    // // TODO ideally the map should fit its bounds to the combined extent
    // // of markers/other content, reactively
    // const map = this.$store.state.map.map;
    // const [x, y] = feature.geometry.coordinates;
    // map.setView([y, x]);
  }

  error(error) {
    console.log('geocode error', error);

    this.store.commit('setGeocodeData', null);
    this.store.commit('setGeocodeStatus', 'error');
  }
}

export default GeocodeClient;
