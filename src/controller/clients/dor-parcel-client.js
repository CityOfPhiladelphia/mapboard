/*
This client is temporary and should be replaced with a generic parcel client
long-term.
*/

import L from 'leaflet';
import BaseClient from './base-client';

class DorParcelClient extends BaseClient {
  fetchById(id, callback) {
    console.log('dor parcel fetch by id:', id);

    const url = this.config.map.featureLayers.dorParcels.url;
    const parcelQuery = L.esri.query({ url });
    const done = this.done.bind(this);

    parcelQuery.where("MAPREG = '" + id + "'");
    parcelQuery.run(done);
  }

  fetchByLatLng(latLng, callback) {
    console.log('dor parcel fetch by latlng:', latLng);

    const url = this.config.map.featureLayers.dorParcels.url;
    const parcelQuery = L.esri.query({ url });
    const done = this.done.bind(this);

    parcelQuery.contains(latLng);
    parcelQuery.run(done);
  }

  done(error, featureCollection, response) {
    console.log('did get dor parcels', featureCollection);

    if (error) {
      console.warn('did get dor parcels error', error);
      return;
    }

    if (!featureCollection) {
      console.warn('did get dor parcels, but no features');
      return;
    }

    const features = featureCollection.features;
    this.store.commit('setDorParcels', featureCollection.features);

    // this belongs in router?
    // const shouldGeocode = (
    //   this.activeParcelLayer === 'dor' &&
    //   //features.length < 1 &&
    //   // features.length < 1 &&
    //   this.$store.state.lastSearchMethod === 'reverseGeocode'
    // );
    // // console.log('dor shouldGeocode', shouldGeocode);
    // if (shouldGeocode) {
    //   // TODO sort by mapreg, status
    //   this.geocode(features[0].properties.MAPREG);
    // } else {
    //   this.fetchData();
    // }
  }
}

export default DorParcelClient;
