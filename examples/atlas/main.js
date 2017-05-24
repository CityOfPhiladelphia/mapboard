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

function cleanDorAttribute(attr) {
  // trim leading and trailing whitespace
  let cleanAttr = attr ? String(attr) : '';
  cleanAttr = cleanAttr.replace(/\s+/g, '');

  // return null for zeros and empty strings
  if (['', '0'].indexOf(cleanAttr) > -1) {
    return null;
  }

  return cleanAttr;
}

// TODO put this in base config transforms
function concatDorAddress(parcel) {
  const STREET_FIELDS = ['STDIR', 'STNAM', 'STDES', 'STDESSUF'];
  const props = parcel.properties;

  // handle house num
  const addressLow = cleanDorAttribute(props.HOUSE);
  const addressHigh = cleanDorAttribute(props.STEX);
  const addressSuffix = cleanDorAttribute(props.SUFFIX);
  let address = addressLow;
  address = address + (addressHigh ? '-' + addressHigh : '');
  address = address + (addressSuffix || '');

  // handle unit
  var unit = cleanDorAttribute(props.UNIT);
  unit && (unit = '# ' + unit);

  // clean up attributes
  let comps = STREET_FIELDS.map(streetField => props[streetField]);
  comps = comps.map(cleanDorAttribute);
      // TODO handle individual address comps (like mapping stex=2 => 1/2)
      // addressLow = comps.HOUSE,
      // addressHigh = comps.STEX,
      // streetPredir = comps.STDIR,
      // streetName = comps.STNAM,
      // streetSuffix = comps.STDES,
      // streetPostdir = comps.STDESSUF,

  // add address to front
  comps = [address].concat(comps);

  // add unit to end
  comps = comps.concat([unit]);

  // remove nulls and concat
  address = comps.filter(Boolean).join(' ');

  return address;
}

// configure accounting.js
accounting.settings.currency.precision = 0;

Mapboard.default({
  rootStyle: {
    height: '600px'
  },
  baseConfig: '//gist.githubusercontent.com/rbrtmrtn/09b4f35396f97499c3097e2fecaed8e7/raw/d36124d006bed52124ead05535bb92d4c562fd00/config.js',
  dataSources: {
    nearby: {
      type: 'json',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
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
      }
    },
    opa: {
      type: 'json',
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      options: {
        params: {
          parcel_number: feature => feature.properties.opa_account_num
        },
        success(data) {
          return data[0];
        }
      }
    },
    // TODO elections and divisions
    // elections: {
    //   url: 'https://api.phila.gov/elections',
    //   type: 'json',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // }
    // divisions: {
    //   url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
    //   type: 'json',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    stormwater: {
      type: 'json',
      url: 'https://api.phila.gov/stormwater',
      options: {
        params: {
          search: feature => feature.properties.street_address
        },
        success(data) {
          return data[0];
        }
      }
    },
    zoningDocs: {
      type: 'json',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: feature => "select * from zoning_documents_20170420 where address_std = '" + feature.properties.street_address + "' or addrkey = " + feature.properties.li_address_key,
        },
        success(data) {
          return data;
        }
      }
    },
    dorDocuments: {
      type: 'json',
      url: '//ase.phila.gov/arcgis/rest/services/RTT/MapServer/0/query',
      options: {
        params: {
          where(feature, state) {
            const parcel = state.dorParcels[0];
            console.log('going to get dor docs for parcel', parcel);
            const parcelAddress = concatDorAddress(parcel);
            let where = `ADDRESS = '${parcelAddress}'`;

            // check for unit num
            const unitNum = feature.properties.unit_num;

            if (unitNum) {
              console.log('unit num')
              where += ` AND CONDO_UNIT = '${unitNum}'`;
            }

            return where;
          },
          outFields: '*',
          f: 'json'
        },
        success(data) {
          // arcgis server doesn't set application-type headers, so parse json
          return JSON.parse(data);
        }
      },
      // this should return false if anything necessary for the fetch is missing
      // from state.
      // REVIEW would this be better handled by a `deps` property?
      ready(state) {
        const hasParcel = !!state.dorParcels[0];
        if (!hasParcel) {
          return false;
        }
        return true;
      }
    },
    '311': {
      type: 'esri-nearby',
      url: 'http://192.168.103.143:6080/arcgis/rest/services/GSG/GIS311_365DAYS/MapServer/0',
      options: {
        geometryServerUrl: 'http://192.168.103.143:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/',
        radius: 500,
        units: 'feet',
      },
    },
    // threeOneOneBuffer: {
    //   url: 'http://192.168.103.143:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/buffer',
    //   type: 'json',
    //   dependency: 'threeOneOneData',
    //   params: {
    //     // query: feature => L.esri.query({url: this.$config.esri.tools.buffer.url}).contains(feature)
    //     geometries: feature => '['+feature.geometry.coordinates[0]+', '+feature.geometry.coordinates[1]+']',
    //     inSR: () => 4326,
    //     outSR: () => 4326,
    //     bufferSR: () => 4326,
    //     distances: () => .0015,
    //     unionResults: () => true,
    //     geodesic: () => false,
    //     f: () => 'json',
    //   },
    //   success(dataString) {
    //     // return L.polygon(data['geometries'][0]['rings'][0], {color: 'green'});
    //     //return JSON.parse(dataString);
    //     return dataString
    //   }
    // },
    // threeOneOneData: {
    //   callback: true,
    //   callbackDataName: 'threeOneOneBuffer',
    //   dependentOn: 'threeOneOneBuffer',
    //   type: 'esri',
    //   params: {
    //     query: feature => L.esri.query({url: 'http://192.168.103.143:6080/arcgis/rest/services/GSG/GIS311_365DAYS/MapServer/0'})//.within(state.sources.threeOneOneBuffer)
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    // vacantLand: {
    //   type: 'esri',
    //   url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0',
    //   options: {
    //     relationship: 'contains',
    //     // params: {
    //     //   query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0'}).contains(feature)
    //     // },
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    // vacantBuilding: {
    //   type: 'esri',
    //   params: {
    //     query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Bldg/FeatureServer/0'}).contains(feature)
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    // // TODO take zoningBase out and use AIS for base zoning district
    zoningBase: {
      type: 'esri',
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/',
      options: {
        relationship: 'contains',
      },
      success(data) {
        return data;
      }
    },
    zoningOverlay: {
      type: 'esri',
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/1/',
      options: {
        relationship: 'contains',
      },
      success(data) {
        return data;
      }
    }
  },
  overlays: {
    '311': {
      type: 'point',
      dataSource: '311',
      options: {
        marker: 'circle',
        style: {
          radius: 6,
          fillColor: '#ff3f3f',
        	color: '#ff0000',
        	weight: 1,
        	opacity: 1,
        	fillOpacity: 1.0
        },
      },
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
      dataSources: [],
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
                type: 'vertical-table',
                slots: {
                  title: 'Parcel Details',
                  fields: [
                    {
                      label: 'Map Registry #',
                      value(state, item) {
                        return item.properties.MAPREG;
                      },
                    },
                    {
                      label: 'Parcel Address',
                      value(state, item) {
                        return concatDorAddress(item);
                      },
                    },
                    {
                      label: 'Status',
                      value(state, item) {
                        const status = item.properties.STATUS;
                        let desc;
                        switch(status) {
                          case 1:
                            desc = 'Active';
                            break;
                          case 2:
                            desc = 'Inactive';
                            break;
                          case 3:
                            desc = 'Remainder';
                            break;
                          default:
                            break;
                        }
                        return desc;
                      },
                    },
                    {
                      label: 'Origination Date',
                      value(state, item) {
                        return item.properties.ORIG_DATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Inactive Date',
                      value(state, item) {
                        return item.properties.INACTDATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Has Air Rights',
                      value(state, item) {
                        const suffix = item.properties.SUFFIX;
                        return suffix === 'A' ? 'Yes' : 'No';
                      },
                    },
                    {
                      label: 'Is Condo',
                      value(state, item) {
                        return item.properties.CONDOFLAG ? 'Yes' : 'No';
                      },
                    },
                    {
                      label: 'Perimeter',
                      value(state, item) {
                        return 'TODO';
                      },
                    },
                    {
                      label: 'Area',
                      value(state, item) {
                        return 'TODO';
                      },
                    },
                  ]
                }  // end slots
              }  // end vertical table
            ] // end parcel tab content comps
          }, // end parcel tab options
          slots: {
            // REVIEW should this go in options? maybe not, since it should be
            // reactive.
            items(state) {
              return state.dorParcels;
            }
          }
        } // end dor parcel tab group comp
      ], // end deeds comps
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'pwd'
    },
    {
      key: 'pwd',
      icon: 'tint',
      label: 'PWD',
      dataSources: [],
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
      dataSources: [],
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
      dataSources: ['zoningOverlay',
                    'zoningDocs'
                    ],
      components: [
        {
          type: 'badge',
          slots: {
            title: 'Base District',
            value(state) {
              const data = state.sources.zoningBase.data[0].properties;
              return data.LONG_CODE;
            },
            description(state) {
              const data = state.sources.zoningBase.data[0].properties.LONG_CODE;
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
    },
    {
      key: '311',
      icon: 'phone',
      label: '311',
      dataSources: ['311'],
      components: [
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      overlays: ['311'],
      parcels: 'pwd',
      components: [
        {
          type: 'horizontal-table',
          options: {
            fields: [
              {
                label: 'Date',
                sourceField: 'REQUESTED_DATETIME',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Address',
                sourceField: 'ADDRESS'
              },
              {
                label: 'Subject',
                sourceField: 'SUBJECT'
              },
              {
                label: 'Description',
                sourceField: 'DESCRIPTION'
              },
              {
                label: 'Distance',
                sourceField: 'DISTANCE'
              }
            ]
          },
          slots: {
            title(state) {
              const data = state.sources['311'].data;
              const count = data.length;
              return `Nearby Service Requests (${count})`;
            },
            items(state) {
              const data = state.sources['311'].data
              const rows = data.map(row => {
                const props = row.properties;
                props.DISTANCE = 'TODO';
                return props;
              });
              return rows;
            }
          }
        }
      ]
    }
  ],
  // events: {
  //   geocodeResult(e) {
  //     console.log('**HOST** geocode result:', e.properties.street_address);
  //   }
  // }
});
