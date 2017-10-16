import axios from 'axios';
import turf from 'turf';
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

  fetchNearby(feature, dataSource, dataSourceKey) {
    // console.log('fetch esri nearby', feature);

    // const url = dataSource.url;
    const { options } = dataSource;
    const dataSourceUrl = dataSource.url;
    const { geometryServerUrl } = options;
    const calculateDistance = options.calculateDistance;

    // params.geometries = `[${feature.geometry.coordinates.join(', ')}]`
    // TODO get some of these values from map, etc.
    const coords = feature.geometry.coordinates;
    const params = {
      // geometries: feature => '[' + feature.geometry.coordinates[0] + ', ' + feature.geometry.coordinates[1] + ']',
      geometries: `[${coords.join(', ')}]`,
      inSR: 4326,
      outSR: 4326,
      bufferSR: 4326,
      distances: .0028,
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

      const xyCoords = data['geometries'][0]['rings'][0];
      const latLngCoords = xyCoords.map(xyCoord => [...xyCoord].reverse());

      // get nearby features using buffer
      const buffer = L.polygon(latLngCoords);
      const map = this.dataManager.store.state.map.map

      // DEBUG
      // buffer.addTo(map);

      this.fetchSpatialQuery(dataSourceKey,
                             dataSourceUrl,
                             'within',
                             buffer,
                             calculateDistance ? coords : null
                            );
    }, response => {
      // console.log('did fetch esri nearby error', response);
      this.didFetchData(dataSource, 'error');
    });
  }

  fetchSpatialQuery(dataSourceKey, url, relationship, targetGeom, calculateDistancePt) {
    // console.log('fetch esri spatial query', dataSourceKey, url, relationship, targetGeom);

    const query = L.esri.query({ url })[relationship](targetGeom);

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
