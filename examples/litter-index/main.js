const GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';

Mapboard.default({
  dataSources: {
  },
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
          type: 'horizontal-table',
          slots: {
            fields: [
              {
                label: 'Trash & Recycling Day',
                value: 'Wednesday'
              },
              {
                label: 'Recycling Diversion Rate',
                value: '10%'
              },
              {
                label: 'Sanitation District',
                value: '1A'
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
      dynamicMapLayers: [
        // 'stormwater'
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
