const GATEKEEPER_KEY = '35ae5b7bf8f0ff2613134935ce6b4c1e';

Mapboard.default({
  rootStyle: {
    height: '600px'
  },
  //baseConfig: 'https://gist.githubusercontent.com/rbrtmrtn/09b4f35396f97499c3097e2fecaed8e7/raw/3c068090d544f3b6e0e31a37acea652a30621c7e/config.js',
  baseConfig: 'https://gist.githubusercontent.com/ajrothwell/f5df4d85e09f5821c16329a96889368d/raw/480ed332d481325f2b1a0c1d8322ccae27bfb2ba/config.js',
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
  cyclomedia: {
    enabled: true
  },
  pictometry: {
    enabled: false
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
                }
              },
              {
                label: 'Sale Date',
                value(state) {
                  const data = state.sources.opa.data;
                  return data.sale_date;
                }
              },
              {
                label: 'Sale Price',
                value(state) {
                  const data = state.sources.opa.data;
                  return data.sale_price;
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
