import axios from 'axios';
import BaseClient from './base-client';
import proj4 from 'proj4';

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
    const url = dataSource.url;
    const options = dataSource.options;
    const srid = options.srid || 4326;
    const dateMinNum = options.dateMinNum || null;
    const dateMinType = options.dateMinType || null;
    const dateField = options.dateField || null;
    const successFn = options.success;
    const calculateDistance = options.calculateDistance;
    const table = options.table;

    // const EPSG2272 = '+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs'
    // const coords = proj4(EPSG2272, feature.geometry.coordinates);
    // console.log('proj4 coords', coords);

    const distQuery = "ST_Distance(the_geom::geography, ST_SetSRID(ST_Point("
                    + feature.geometry.coordinates[0]
                    + "," + feature.geometry.coordinates[1]
                    + ")," + srid + ")::geography)";


    let select = '*'
    if (calculateDistance) {
      select = "*, " + distQuery + " as distance";
      console.log('calculateDistance is on using select:', select);
    }

    params['q'] = "select" + select + " from " + table + " where " + distQuery + " < 250";

    if (dateMinNum) {
      console.log('date if 1 year is running');
      params['q'] = params['q'] + " and dispatch_date > '" + moment().subtract(1, 'year').format('YYYY-MM-DD') + "'"
    }

    // if the data is not dependent on other data
    axios.get(url, { params }).then(response => {
      // call success fn
      let data = response.data.rows;
      console.log('table and data', table, data);

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
