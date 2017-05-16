const GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';

// TODO get user-entered address from url(?)
const searchInput = '1300 market street';

Mapboard.default({
  cyclomedia: {
    enabled: false
  },
  pictometry: {
    enabled: false
  },
  baseConfig: '//gist.githubusercontent.com/rbrtmrtn/09b4f35396f97499c3097e2fecaed8e7/raw/3c068090d544f3b6e0e31a37acea652a30621c7e/config.js',
  // dataSources: {},
  greeting: {
    components: [
      {
        type: 'image_',
        slots: {
          source: 'front.png'
        }
      }
    ]
  },
  defaultAddress: searchInput,
  topics: [
    {
      key: 'litter',
      label: 'Litter',
      icon: 'fa-trash-o',
      components: [
        {
          type: 'badge',
          slots: {
            title: 'Litter Index',
            value: 4.3,
            description: 'out of 10',
          }
        },
        {
          type: 'vertical-table',
          slots: {
            fields: [
              {
                label: 'Trash & Recycling Day',
                value(state) {
                  const day = state.geocode.data.properties.rubbish_recycle_day;
                  const DAYS_FORMATTED = {
                    'MON': 'Monday',
                    'TUE': 'Tuesday',
                    'WED': 'Wednesday',
                    'THU': 'Thursday',
                    'FRI': 'Friday'
                  };
                  return DAYS_FORMATTED[day];
                }
              },
              {
                label: 'Recycling Diversion Rate',
                value(state) {
                  const rate = state.geocode.data.properties.recycling_diversion_rate;
                  return `${parseInt(rate * 100)}%`;;
                },
              },
              {
                label: 'Sanitation District',
                value(state) {
                  const district = state.geocode.data.properties.sanitation_district;
                  return district;
                }
              },
              {
                label: 'Sanitation Convenience Center',
                value: '1615 S 51st St, Philadelphia, PA 19143'
              },
              {
                label: 'Block Captain',
                value: 'Jane Doe, 1345 S 52nd St'
              },
              {
                label: 'PMBC Representative',
                value: 'John Smith, 2145 S 53rd St'
              },
            ],
          }
        },
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      dynamicMapLayers: [
      ],
      parcels: 'pwd'
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
        url: function (input) {
          return '//api.phila.gov/ais/v1/search/' + input;
        },
        params: {
          gatekeeperKey: GATEKEEPER_KEY
        }
      },
      reverseGeocode: {
        url: function (input) {
          return '//api.phila.gov/ais/v1/reverse_geocode/' + input;
        },
        params: {
          gatekeeperKey: GATEKEEPER_KEY
        }
      }
    }
  },
});
