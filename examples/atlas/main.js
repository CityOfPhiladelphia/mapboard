const GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';

const ZONING_CODE_MAP = {
  'RSD-1': 'Residential Single Family Detached-1',
  'RSD-2': 'Residential Single Family Detached-2',
  'RSD-3': 'Residential Single Family Detached-3',
  'RSA-1': 'Residential Single Family Attached-1',
  'RSA-2': 'Residential Single Family Attached-2',
  'RSA-3': 'Residential Single Family Attached-3',
  'RSA-4': 'Residential Single Family Attached-4',
  'RSA-5': 'Residential Single Family Attached-5',
  'RTA-1': 'Residential Two-Family Attached-1',
  'RM-1': 'Residential Multi-Family-1',
  'RM-2': 'Residential Multi-Family-2',
  'RM-3': 'Residential Multi-Family-3',
  'RM-4': 'Residential Multi-Family-4',
  'RMX-1': 'Residential Mixed-Use-1',
  'RMX-2': 'Residential Mixed-Use-2',
  'RMX-3': 'Residential (Center City) Mixed-Use-3',
  'CA-1': 'Auto-Oriented Commercial-1',
  'CA-2': 'Auto-Oriented Commercial-2',
  'CMX-1': 'Neighborhood Commercial Mixed-Use-1',
  'CMX-2': 'Neighborhood Commercial Mixed-Use-2',
  'CMX-2.5': 'Neighborhood Commercial Mixed-Use-2.5',
  'CMX-3': 'Community Commercial Mixed-Use',
  'CMX-4': 'Center City Commercial Mixed-Use',
  'CMX-5': 'Center City Core Commercial Mixed-Use',
  'I-1': 'Light Industrial',
  'I-2': 'Medium Industrial',
  'I-3': 'Heavy Industrial',
  'I-P': 'Port Industrial',
  'ICMX': 'Industrial Commercial Mixed-Use',
  'IRMX': 'Industrial Residential Mixed-Use',
  'SP-ENT': 'Commercial Entertainment (Casinos)',
  'SP-AIR': 'Airport',
  'SP-INS': 'Institutional Development',
  'SP-STA': 'Stadium',
  'SP-PO-A': 'Recreation',
  'SP-PO-P': 'Recreation',
};

// configure accounting.js
accounting.settings.currency.precision = 0;

Mapboard.default({
  rootStyle: {
    height: '600px'
  },
  baseConfig: 'https://gist.githubusercontent.com/ajrothwell/f5df4d85e09f5821c16329a96889368d/raw/bf7022ce587f75125c55b00c623fa24cf96a8b06/config.js',
  dataSources: {
    nearby: {
      url: 'https://phl.carto.com/api/v2/sql',
      type: 'ajax',
      params: {
        q: function(feature) {
          const aisX = feature.geometry.coordinates[0];
          const aisY = feature.geometry.coordinates[1];
          const table = 'incidents_part1_part2';
          const distanceFn = "ST_Distance(the_geom_webmercator, ST_Transform(CDB_LatLng(" + aisY + ", " + aisX + "), 3857)) * 3.28084";
          const where = distanceFn + ' < 500';
          //fieldMap = activityType.fieldMap,
          const select = ['ST_X(the_geom) as x',
                          'ST_Y(the_geom) as y',
                          distanceFn + "AS distance",
                        ].join(', ');
          query = ['SELECT', select, 'FROM', table, 'WHERE', where].join(' ');
          return (query);
          }
      },
      success(data) {
        return data
      }
    },
    opa: {
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      type: 'ajax',
      params: {
        parcel_number: feature => feature.properties.opa_account_num
      },
      success(data) {
        return data[0];
      }
    },
    // TODO elections and divisions
    // elections: {
    //   url: 'https://api.phila.gov/elections',
    //   type: 'ajax',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // }
    // divisions: {
    //   url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
    //   type: 'ajax',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    stormwater: {
      url: 'https://api.phila.gov/stormwater',
      type: 'ajax',
      params: {
        search: feature => feature.properties.street_address
      },
      success(data) {
        return data[0];
      }
    },
    threeOneOneBuffer: {
      url: 'http://192.168.103.143:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/buffer',
      type: 'ajax',
      params: {
        // query: feature => L.esri.query({url: this.$config.esri.tools.buffer.url}).contains(feature)
        geometries: feature => '['+feature.geometry.coordinates[0]+', '+feature.geometry.coordinates[1]+']',
        inSR: () => '4326',
        outSR: () => '4326',
        bufferSR: () => '4326',
        distances: () => '.0015',
        unionResults: () => true,
        geodesic: () => false,
        f: () => 'json',
      },
      success(data) {
        return L.polygon(data['geometries'][0]['rings'][0], {color: 'green'});
      }
    },
    // threeOneOneData: {
    //   type: 'esri',
    //   params: {
    //     // query: feature => L.esri.query({url: 'https://192.168.103.143:6080/arcgis/rest/services/GSG/GIS311_365DAYS/MapServer/0'}).within(state.sources.threeOneOneBuffer)
    //     query: function() {
    //       const lQuery = L.esri.query({url: 'https://192.168.103.143:6080/arcgis/rest/services/GSG/GIS311_365DAYS/MapServer/0'});
    //       //return lQuery.within( value(state) {return state.sources.threeOneOneBuffer} )
    //       //return 5;
    //     }
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    vacantLand: {
      type: 'esri',
      params: {
        query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0'}).contains(feature)
      },
      success(data) {
        return data;
      }
    },
    // TODO take this out and use AIS for base zoning district
    zoningBase: {
      //url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/',
      type: 'esri',
      params: {
        query: feature => L.esri.query({url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/'}).contains(feature.geometry)
      },
      success(data) {
        return data;
      }
    },
    zoningCarto: {
      url: 'https://phl.carto.com/api/v2/sql',
      type: 'ajax',
      params: {
        q: feature => "select * from zoning_documents_20170420 where address_std = '" + feature.properties.street_address + "' or addrkey = " + feature.properties.li_address_key,
      },
      success(data) {
        return data
      }
    },
  },
  cyclomedia: {
    enabled: false
  },
  pictometry: {
    enabled: false
  },
  // reusable transforms for topic data. see `topics` section for usage.
  transforms: {
    currency: {
      // a list of global objects this transform depends on
      globals: ['accounting'],
      // this is the function that gets called to perform the transform
      transform(value, globals) {
        const accounting = globals.accounting;
        return accounting.formatMoney(value);
      }
    },
    date: {
      globals: ['moment'],
      transform(value, globals) {
        const moment = globals.moment;
        return moment(value).format('YYYY-MM-DD');
      }
    },
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
                  return state.geocode.data.properties.opa_account_num;
                }
              },
              {
                label: 'OPA Address',
                value(state) {
                  return state.geocode.data.properties.opa_address;
                }
              },
              {
                label: 'Owners',
                value(state) {
                  const owners = state.geocode.data.properties.opa_owners;
                  const ownersJoined = owners.join(', ');
                  return ownersJoined;
                }
              },
              {
                label: `Assessed Value (${new Date().getFullYear()})`,
                value(state) {
                  const data = state.sources.opa.data;
                  return data.market_value;
                },
                transforms: [
                  'currency'
                ]
              },
              {
                label: 'Sale Date',
                value(state) {
                  const data = state.sources.opa.data;
                  return data.sale_date;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Sale Price',
                value(state) {
                  const data = state.sources.opa.data;
                  return data.sale_price;
                },
                transforms: [
                  'currency'
                ]
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
      key: 'deeds',
      icon: 'book',
      label: 'Deeds',
      components: [
        {
          type: 'collection-summary',
          options: {
            descriptor: 'parcel',
            // this will include zero quantities
            // includeZeroes: true,
            getValue(item) {
              return item.properties.STATUS;
            },
            context: {
              singular: list => `There is ${list} at this address.`,
              plural: list => `There are ${list} at this address.`
            },
            types: [
              {
                value: 1,
                label: 'active parcel'
              },
              {
                value: 2,
                label: 'inactive parcel'
              },
              {
                value: 3,
                label: 'remainder parcel'
              }
            ]
          },
          slots: {
            items(state) {
              return state.dorParcels;
            }
          }
        },
        {
          type: 'tab-group',
          options: {
            getKey(item) {
              return item.properties.OBJECTID;
            },
            getTitle(item) {
              return item.properties.MAPREG;
            },
            // components for the content pane. this essentially a topic body.
            components: [
              {
                type: 'callout',
                slots: {
                  text() {
                    return 'testing';
                  }
                }
              }
            ]
          },
          slots: {
            // REVIEW should this go in options? maybe not, since it should be
            // reactive.
            items(state) {
              return state.dorParcels;
            }
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
    },
    {
      key: 'zoning',
      icon: 'building-o',
      label: 'Zoning',
      //dataSources: ['zoningBase'],
      components: [
        {
          type: 'badge',
          slots: {
            title: 'Base District',
            code(state) {
              const data = state.sources.zoningBase.data.properties.LONG_CODE;
              // TODO just use AIS - can't right now because there are no hyphens in it
              //const data = state.geocode.data.properties.zoning;
              return data;
            },
            description(state) {
              const data = state.sources.zoningBase.data.properties.LONG_CODE;
              return ZONING_CODE_MAP[data];
            },
          }
        },
      ],
      basemap: 'dor',
      dynamicMapLayers: [
        'zoning'
      ],
      identifyFeature: 'dor-parcel',
      parcels: 'dor'
    }
  ],
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
  // events: {
  //   geocodeResult(e) {
  //     console.log('**HOST** geocode result:', e.properties.street_address);
  //   }
  // }
});
