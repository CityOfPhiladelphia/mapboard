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
    console.log('geocode fetch is running, input:', input);
    const store = this.store;

    // // use forward geocode unless it has failed, reverse geocode it if fails
    // let geocodeConfig;
    // if (store.state.geocode.forwardStatus === null) {
    //   console.log('setting to forward geocode');
    //   geocodeConfig = this.config.geocoder.forward;
    //   this.store.commit('setGeocodeForwardStatus', 'waiting');
    // } else {
    //   console.log('setting to reverse geocode');
    //   geocodeConfig = this.config.geocoder.reverse;
    //   this.store.commit('setGeocodeReverseStatus', 'waiting');
    // }

    const geocodeConfig = this.config.geocoder;
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
    console.log('geocode success', response.config.url);

    const store = this.store;
    const data = response.data;
    const url = response.config.url;
    // console.log(url)

    // The section below was added for adding reverse geocoding, which was deprecated
    // let direction;
    // if (url.includes('search')){
    //   direction = 'forward';
    // } else {
    //   direction = 'reverse';
    // }
    // console.log('success direction', direction);

    // TODO handle multiple results

    if (!data.features || data.features.length < 1) {
      console.log('geocode got no features', data);
      return;
    }

    // TODO do some checking here
    const feature = data.features[0];
    let relatedFeatures = [];
    for (let relatedFeature of data.features.slice(1)){
      if (!!feature.properties.address_high) {
        if (relatedFeature.properties.address_high) {
          relatedFeatures.push(relatedFeature);
        }
      } else {
        relatedFeatures.push(relatedFeature);
      }
    }

    store.commit('setGeocodeData', feature);
    store.commit('setGeocodeRelated', relatedFeatures);
    store.commit('setGeocodeStatus', 'success');
    // if (direction === 'forward') {
    //   store.commit('setGeocodeForwardStatus', 'success');
    // } else {
    //   store.commit('setGeocodeReverseStatus', 'success');
    // }

    return feature;
  }

  error(error) {
    console.log('geocode error', error);
    const store = this.store;
    store.commit('setGeocodeStatus', 'error');
    store.commit('setGeocodeData', null);
    store.commit('setGeocodeRelated', null);

    // if (this.store.state.activeParcelLayer === 'dor') {
    //   console.log('ran ais on a dor parcel and got no response');
    //   const pwdParcel = store.state.pwdParcel;
    //   if (pwdParcel) {
    //     console.log('running ais again on the pwd parcel', pwdParcel.properties.PARCELID);
    //     this.dataManager.fetch(pwdParcel.properties.PARCELID);
    //   }
    // }

    // Everything below was added for adding reverse geocoding, which was deprecated
    // console.log('error config', error.config);
    // const url = error.config.url;
    // let direction;
    // if (url.includes('search')){
    //   direction = 'forward';
    // } else {
    //   direction = 'reverse';
    // }
    // const store = this.store;
    // const clickCoords = store.state.clickCoords;
    //
    // this.store.commit('setGeocodeData', null);
    // this.store.commit('setGeocodeStatus', 'error');
    // if (direction === 'forward') {
    //   store.commit('setGeocodeForwardStatus', 'error');
    //   console.log('geocode error going forward, checking if there are coordinates to run reverse');
    //   if (clickCoords) {
    //     console.log('geocode error going forward, now going in reverse with ', clickCoords);
    //     this.fetch([clickCoords.lng, clickCoords.lat]);
    //   }
    // } else {
    //   store.commit('setGeocodeReverseStatus', 'error');
    // }
  }
}

export default GeocodeClient;
