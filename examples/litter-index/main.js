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
  baseConfig: '//s3.amazonaws.com/mapboard-base-config-clean-philly/config.js',
  defaultAddress: searchInput,
  topics: [
    {
      key: 'litter',
      label: 'Litter',
      icon: 'fa-trash-o',
      components: [
        // this is not ready for the first release of the litter index site
        // {
        //   type: 'badge',
        //   slots: {
        //     title: 'Litter Index',
        //     value: 4.3,
        //     description: 'out of 10',
        //   }
        // },
        {
          type: 'vertical-table',
          options: {
            nullValue: 'None'
          },
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
              // {
              //   label: 'PMBC Representative',
              //   value: 'NOT READY'
              // },
              {
                label: 'Sanitation Convenience Center',
                value(state) {
                  return state.geocode.data.properties.sanitation_convenience_center;
                }
              },
              {
                label: 'Clean Philly Block Captain',
                value(state) {
                  return state.geocode.data.properties.clean_philly_block_captain;
                }
              },
              {
                label: 'PPR Friends Group',
                value(state) {
                  return state.geocode.data.properties.ppr_friends;
                }
              },
              {
                label: 'Watershed Group',
                value(state) {
                  return state.geocode.data.properties.major_phila_watershed;
                }
              },
              {
                label: 'Commercial Corridor Manager',
                value(state) {
                  return state.geocode.data.properties.commercial_corridor;
                }
              },
              {
                label: 'Neighborhood Advisory Committee',
                value(state) {
                  return state.geocode.data.properties.neighborhood_advisory_committee;
                }
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
    // REVIEW are these necessary?
    center: [39.951618, -75.1650911],
    zoom: 13,
    imagery: {
      enabled: false
    },
    historicBasemaps: {
      enabled: false
    },
  }
});
