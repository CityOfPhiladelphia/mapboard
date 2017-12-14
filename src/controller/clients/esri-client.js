import axios from 'axios';
import turf from 'turf';
import BaseClient from './base-client';
import Leaflet from 'leaflet';

class EsriClient extends BaseClient {
  fetch(feature, dataSource, dataSourceKey) {
    const url = dataSource.url;
    const { relationship, targetGeometry, ...options } = dataSource.options;

    // check if a target geometry fn was specified. otherwise, use geocode feat
    let geom;
    if (targetGeometry) {
      const state = this.store.state;
      // pass leaflet to the targetgeom function so it can construct a custom
      // geometry (such as the lat lng bounds of a set of parcels) if it needs
      // to. use case: fetching regmaps.
      geom = targetGeometry(state, Leaflet);
    } else {
      geom = feature.geometry;
    }

    // handle null geom
    if (!geom) {
      this.dataManager.didFetchData(dataSourceKey, 'error');
      return;
    }

    this.fetchBySpatialQuery(dataSourceKey, url, relationship, geom, options);
  }

  fetchNearby(feature, dataSource, dataSourceKey) {
    const dataSourceUrl = dataSource.url;
    const {
      calculateDistance,
      geometryServerUrl,
      ...options
    } = dataSource.options;

    // params.geometries = `[${feature.geometry.coordinates.join(', ')}]`
    // TODO get some of these values from map, etc.
    const coords = feature.geometry.coordinates;
    const params = {
      // geometries: feature => '[' + feature.geometry.coordinates[0] + ', ' + feature.geometry.coordinates[1] + ']',
      geometries: `[${coords.join(', ')}]`,
      inSR: 4326,
      outSR: 4326,
      bufferSR: 4326,
      distances: 0.0028,
      unionResults: true,
      geodesic: false,
      f: 'json',
    };
    // console.debug('esri nearby params', params);

    // get buffer polygon
    const bufferUrl = geometryServerUrl.replace(/\/$/, '') + '/buffer';

    axios.get(bufferUrl, { params }).then(response => {
      const data = response.data;

      // console.log('did get esri nearby buffer', data);

      const geoms = data.geometries || [];
      const geom = geoms[0] || {};
      const rings = geom.rings || [];
      const xyCoords = rings[0];

      // check for xy coords
      if (!xyCoords) {
        // we can't do anything without coords, so bail out
        this.dataManager.didFetchData(dataSourceKey, 'error');
        return;
      }

      const latLngCoords = xyCoords.map(xyCoord => [...xyCoord].reverse());

      // get nearby features using buffer
      const buffer = L.polygon(latLngCoords);
      const map = this.dataManager.store.state.map.map;

      // DEBUG
      // buffer.addTo(map);

      this.fetchBySpatialQuery(dataSourceKey,
                               dataSourceUrl,
                               'within',
                               buffer,
                               options,
                               calculateDistance ? coords : null
                              );
    }, response => {
      console.log('did fetch esri nearby error', response);
      this.dataManager.didFetchData(dataSourceKey, 'error');
    });
  }

  fetchBySpatialQuery(dataSourceKey, url, relationship, targetGeom, options = {}, calculateDistancePt) {
    // console.log('fetch esri spatial query', dataSourceKey, url, relationship, targetGeom);

    let query = L.esri.query({ url })[relationship](targetGeom);

    // apply options by chaining esri leaflet option methods
    const optionsKeys = Object.keys(options) || [];
    query = optionsKeys.reduce((acc, optionsKey) => {
      const optionsVal = options[optionsKey];
      acc = acc[optionsKey](optionsVal);
      return acc;
    }, query);

    query.run((error, featureCollection, response) => {
      // console.log('did get esri spatial query', response, error);

      let features = (featureCollection || {}).features;
      const status = error ? 'error' : 'success';

      // calculate distance
      if (calculateDistancePt) {
        const from = turf.point(calculateDistancePt);

        features = features.map(feature => {
          // console.log('feat', feature);
          const featureCoords = feature.geometry.coordinates;
          const to = turf.point(featureCoords);
          const dist = turf.distance(from, to, 'miles');

          // TODO make distance units an option. for now, just hard code to ft.
          const distFeet = parseInt(dist * 5280);

          feature._distance = distFeet;

          return feature;
        })
      }

      this.dataManager.didFetchData(dataSourceKey, status, features);
    });
  }

}

export default EsriClient;
