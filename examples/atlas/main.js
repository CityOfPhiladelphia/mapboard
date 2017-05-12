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
  //baseConfig: 'https://gist.githubusercontent.com/rbrtmrtn/09b4f35396f97499c3097e2fecaed8e7/raw/3c068090d544f3b6e0e31a37acea652a30621c7e/config.js',
  baseConfig: 'https://gist.githubusercontent.com/ajrothwell/f5df4d85e09f5821c16329a96889368d/raw/c7095f99ef29f3b81a8921e96b8f2abb1c39fd06/config.js',
  dataSources: {
    opa: {
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      params: {
        parcel_number: feature => feature.properties.opa_account_num
      },
      success(data) {
        return data[0];
      }
    },
    zoningBase: {
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/',
      params: {
        code: feature => feature.properties.LONG_CODE
      },
      success(data) {
        return data
      }
    }
  },
  cyclomedia: {
    enabled: true
  },
  pictometry: {
    enabled: false
  },
  transforms: {
    currency: {
      globals: ['accounting'],
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
              const data = state.sources.zoningBase.data.properties;
              return data.LONG_CODE;
            },
            description(state) {
              const data = state.sources.zoningBase.data.properties;
              return ZONING_CODE_MAP[data.LONG_CODE];
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
