/*
This client is temporary and should be replaced with a generic parcel client
long-term.
*/

import L from 'leaflet';
import BaseClient from './base-client';

class PwdParcelClient extends BaseClient {
  fetchById(id, callback) {
    console.log('pwd parcel fetch by id:', id);

    const url = this.config.map.featureLayers.pwdParcels.url;
    const parcelQuery = L.esri.query({ url });
    const done = this.done.bind(this);

    parcelQuery.where('PARCELID = ' + id);
    parcelQuery.run(done);
  }

  fetchByLatLng(latLng, callback) {
    console.log('pwd parcel fetch by latlng:', latLng);

    const url = this.config.map.featureLayers.pwdParcels.url;
    const parcelQuery = L.esri.query({ url });
    const done = this.done.bind(this);

    parcelQuery.contains(latLng);
    parcelQuery.run(done);
  }

  done(error, featureCollection, response) {
    console.log('did get pwd parcel', featureCollection);

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
    this.store.commit('setPwdParcel', feature);

    // this belongs in router i think:
    // const shouldGeocode = (
    //   this.activeParcelLayer === 'pwd' &&
    //   feature &&
    //   this.store.state.lastSearchMethod === 'reverseGeocode'
    // );
    // // console.log('pwd shouldGeocode', shouldGeocode);
    // if (shouldGeocode) {
    //   this.geocode(feature.properties.PARCELID);
    // } else {
    //   this.fetchData();
    // }
  }
}

export default PwdParcelClient;
