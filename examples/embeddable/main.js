const GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';

Mapboard.default({
  rootStyle: {
    height: '600px'
  },
  // baseConfig: '//path/to/config.js',
  dataSources: {
    opa: {
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      params: {
        parcel_number: feature => feature.properties.opa_account_num
      },
      success(data) {
        return data[0];
      }
    }
  },
  topics: [
    {
      key: 'opa',
      icon: 'map-marker',
      label: 'Property Assessments',
      // REVIEW can these be calculated from vue deps?
      dataSources: ['opa'],
      components: [
        {
          type: 'callout',
          slots: {
            text: 'This information is provided by the Office of Property Assessments (OPA), the agency responsible for estimating property values in the City of Philadelphia. OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City websites may still use that name.'
          }
        },
        {
          type: 'vertical-table',
          slots: {
            title: 'Account',
            fields: [
              {
                label: 'OPA Account #',
                value(state) {
                  return state.ais.properties.opa_account_num;
                }
              },
              {
                label: 'OPA Address',
                value(state) {
                  return state.ais.properties.opa_address;
                }
              },
              {
                label: 'Owners',
                value(state) {
                  const owners = state.ais.properties.opa_owners;
                  const ownersJoined = owners.join(', ');
                  return ownersJoined;
                }
              },
              {
                label: `Assessed Value (${new Date().getFullYear()})`,
                value(state) {
                  return state.topicData.opa.market_value;
                }
              },
              {
                label: 'Sale Date',
                value(state) {
                  return state.topicData.opa.sale_date;
                }
              },
              {
                label: 'Sale Price',
                value(state) {
                  return state.topicData.opa.sale_price;
                }
              },
            ]
          }
        }
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'pwd'
    },
    {
      key: 'pwd',
      icon: 'tint',
      label: 'PWD',
      components: [
      ],
      basemap: 'pwd',
      // dynamicMapLayers: [
      //   'stormwater'
      // ],
      identifyFeature: 'pwd-parcel',
      parcels: 'pwd'
    },
    {
      key: 'dor',
      icon: 'book',
      label: 'DOR',
      components: [
      ],
      basemap: 'dor',
      identifyFeature: 'dor-parcel',
      parcels: 'dor'
    }
  ],
  map: {
    center: [39.951618, -75.1650911],
    zoom: 13,
    basemaps: {
      pwd: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
        tiledLayers: [
          'cityBasemapLabels'
        ],
        type: 'featuremap'
      },
      dor: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap/MapServer',
        tiledLayers: [
          'dorBasemapLabels'
        ],
        type: 'featuremap'
      },
      imagery2016: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 2016
      },
      imagery2015: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 2015
      },
      imagery2012: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2012_3in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 2012
      },
      imagery2010: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2010_3in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 2010
      },
      imagery2008: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2008_3in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 2008
      },
      imagery2004: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2004_6in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 2004
      },
      imagery1996: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_1996_6in/MapServer',
        tiledLayers: [
          'imageryBasemapLabels'
        ],
        type: 'imagery',
        year: 1996
      }
    },
    tiledLayers: {
      cityBasemapLabels: {
        // type: 'labels',
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer'
      },
      dorBasemapLabels: {
        // type: 'labels',
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap_Labels_Test2/MapServer'
      },
      imageryBasemapLabels: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_Labels/MapServer'
      }
    },
    dynamicMapLayers: {
      stormwater: {
        url: '//gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer'
      }
    },
    featureLayers: {
      dorParcels: {
        url: '//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/24'
      },
      pwdParcels: {
        url: '//gis.phila.gov/arcgis/rest/services/Water/pv_data/MapServer/0',
      }
    }
  },
  geocoder: {
    methods: {
      search: {
        url: (input) => `//api.phila.gov/ais/v1/search/${input}`,
        params: {
          gatekeeperKey: GATEKEEPER_KEY
        }
      },
      reverseGeocode: {
        url: (input) => `//api.phila.gov/ais/v1/reverse_geocode/${input}`,
        params: {
          gatekeeperKey: GATEKEEPER_KEY
        }
      }
    }
  },
});
