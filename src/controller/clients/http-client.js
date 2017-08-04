import axios from 'axios';
import BaseClient from './base-client';

class HttpClient extends BaseClient {
  evaluateParams(feature, dataSource) {
    const params = {};
    const paramEntries = Object.entries(dataSource.options.params);
    const state = this.store.state;

    for (let [key, valOrGetter] of paramEntries) {
      let val;

      if (typeof valOrGetter === 'function') {
        val = valOrGetter(feature, state);
      } else {
        val = valOrGetter;
      }

      params[key] = val;
    }

    return params;
  }

  fetch(feature, dataSource, dataSourceKey, targetIdFn) {
    const params = this.evaluateParams(feature, dataSource);
    const url = dataSource.url;
    const options = dataSource.options;
    const successFn = options.success;

    // if the data is not dependent on other data
    axios.get(url, { params }).then(response => {
      // call success fn
      let data = response.data;

      if (successFn) {
        data = successFn(data);
      }

      // get target id, if there should be one
      let targetId;
      if (targetIdFn) {
        targetId = targetIdFn(feature);
      }

      this.dataManager.didFetchData(dataSourceKey, 'success', data, targetId);
    }, response => {
      console.log('fetch json error', response);
      this.dataManager.didFetchData(dataSourceKey, 'error');
    });
  }

  fetchNearby(feature, dataSource, dataSourceKey, targetIdFn) {
    const params = this.evaluateParams(feature, dataSource);
    params['q'] = 'SELECT * from incidents_part1_part2 where ST_Distance(the_geom::geography, ST_SetSRID(ST_Point(' + feature.geometry.coordinates[0] + ',' + feature.geometry.coordinates[1] + '),4326)::geography) < 250'
    console.log('params:', params, params['q']);
    const url = dataSource.url;
    const options = dataSource.options;
    const successFn = options.success;

    // if the data is not dependent on other data
    axios.get(url, { params }).then(response => {
      // call success fn
      let data = response.data.rows;

      if (successFn) {
        data = successFn(data);
      }

      // get target id, if there should be one
      let targetId;
      if (targetIdFn) {
        targetId = targetIdFn(feature);
      }

      this.dataManager.didFetchData(dataSourceKey, 'success', data, targetId);
    }, response => {
      console.log('fetch json error', response);
      this.dataManager.didFetchData(dataSourceKey, 'error');
    });
  }
}

export default HttpClient;
