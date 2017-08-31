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
  }

  error(error) {
    console.log('geocode error', error);

    this.store.commit('setGeocodeData', null);
    this.store.commit('setGeocodeStatus', 'error');
  }
}

export default GeocodeClient;
