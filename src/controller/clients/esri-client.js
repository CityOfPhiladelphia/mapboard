import axios from 'axios';
import BaseClient from './base-client';
import Leaflet from 'leaflet';

class EsriClient extends BaseClient {
  fetch(feature, dataSource, dataSourceKey) {
    const options = dataSource.options;
    const url = dataSource.url;
    const relationship = options.relationship;

    // check if a target geometry fn was specified. otherwise, use geocode feat
    const targetGeomFn = options.targetGeometry;
    let geom;

    if (targetGeomFn) {
      const state = this.store.state;
      geom = targetGeomFn(state, Leaflet);
    } else {
      geom = feature.geometry;
    }

    this.fetchSpatialQuery(dataSourceKey, url, relationship, geom);
  }

  fetchSpatialQuery(dataSourceKey, url, relationship, targetGeom) {
    // console.log('fetch esri spatial query', dataSourceKey, url, relationship, targetGeom);

    const query = L.esri.query({ url })[relationship](targetGeom);

    query.run((error, featureCollection, response) => {
      console.log('did get esri spatial query', response, error);

      const data = (featureCollection || {}).features;
      const status = error ? 'error' : 'success';

      this.dataManager.didFetchData(dataSourceKey, status, data);
    });
  }

  fetchNearby(feature, dataSource, dataSourceKey) {
    // console.log('fetch esri nearby', feature);

    // const url = dataSource.url;
    const { options } = dataSource;
    const dataSourceUrl = dataSource.url;
    const { geometryServerUrl } = options;

    // params.geometries = `[${feature.geometry.coordinates.join(', ')}]`
    // TODO get some of these values from map, etc.
    const params = {
      // geometries: feature => '[' + feature.geometry.coordinates[0] + ', ' + feature.geometry.coordinates[1] + ']',
      geometries: `[${feature.geometry.coordinates.join(', ')}]`,
      inSR: 4326,
      outSR: 4326,
      bufferSR: 4326,
      distances: .0015,
      unionResults: true,
      geodesic: false,
      f: 'json',
    };
    // console.debug('esri nearby params', params);

    // get buffer polygon
    const bufferUrl = geometryServerUrl.replace(/\/$/, '') + '/buffer';
    // console.log('im getting the points', bufferUrl);

    axios.get(bufferUrl, { params }).then(response => {
      const data = response.data;

      // console.log('did get esri nearby buffer', data);

      const xyCoords = data['geometries'][0]['rings'][0];
      const latLngCoords = xyCoords.map(xyCoord => [...xyCoord].reverse());

      // get nearby features using buffer
      const buffer = L.polygon(latLngCoords);
      this.fetchSpatialQuery(dataSourceKey,
                                 dataSourceUrl,
                                 'within',
                                 buffer
      );
    }, response => {
      // console.log('did fetch esri nearby error', response);
      this.didFetchData(dataSource, 'error');
    });
  }
}

export default EsriClient;
