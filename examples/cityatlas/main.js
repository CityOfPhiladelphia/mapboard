var GATEKEEPER_KEY = '82fe014b6575b8c38b44235580bc8b11';
// var BASE_CONFIG_URL = '//raw.githubusercontent.com/rbrtmrtn/mapboard-base-config/develop/config.js';
var BASE_CONFIG_URL = '//rawgit.com/rbrtmrtn/mapboard-base-config/d03dacecf5cc4a2d62561428538a2e8593598e6f/config.js';

var ZONING_CODE_MAP = {
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
  'IP': 'Port Industrial',
  'ICMX': 'Industrial Commercial Mixed-Use',
  'IRMX': 'Industrial Residential Mixed-Use',
  'SPENT': 'Commercial Entertainment (Casinos)',
  'SPAIR': 'Airport',
  'SPINS': 'Institutional Development',
  'SPSTA': 'Stadium',
  'SPPOA': 'Recreation',
  'SPPOP': 'Recreation',
};

function cleanDorAttribute(attr) {
  // console.log('cleanDorAttribute is running with attr', attr);
  // trim leading and trailing whitespace
  var cleanAttr = attr ? String(attr) : '';
  cleanAttr = cleanAttr.replace(/\s+/g, '');

  // return null for zeros and empty strings
  // if (['', '0'].indexOf(cleanAttr) > -1) {
  //   return null;
  // }

  // return empty for zeros and null
  if ([null, '0'].indexOf(cleanAttr) > -1) {
    return '';
  }

  // console.log('cleanDorAttribute cleanAttr result:', cleanAttr);
  return cleanAttr;
}

// TODO put this in base config transforms
function concatDorAddress(parcel, includeUnit) {
  console.log('concatDorAddress is running with parcel:', parcel, 'includeUnit:', includeUnit);
  includeUnit = typeof includeUnit !== 'undefined' ? includeUnit: true;
  var STREET_FIELDS = ['STDIR', 'STNAM', 'STDES', 'STDESSUF'];
  var props = parcel.properties;

  // handle house num
  var addressLow = cleanDorAttribute(props.HOUSE);
  var addressHigh = cleanDorAttribute(props.STEX);
  // maybe should be props.SUF below (it said props.SUFFIX)
  var addressSuffix = cleanDorAttribute(props.SUF);
  var address = addressLow;
  address = address + (addressHigh ? '-' + addressHigh : '');
  address = address + (addressSuffix || '');

  // handle unit
  var unit = cleanDorAttribute(props.UNIT);
  if (unit) unit = '# ' + unit;

  // clean up attributes
  var comps = STREET_FIELDS.map(function(streetField) {
    return props[streetField];
  });
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
  if (includeUnit) comps = comps.concat([unit]);

  // remove nulls and concat
  address = comps.filter(Boolean).join(' ');

  // console.log('concatDorAddress address result:', address);
  if (address === '') {
    address = 'Parcel has no address';
  }
  return address;
}

function getVacancyText(state) {
  var land = state.sources.vacantLand.data
  var building = state.sources.vacantBuilding.data
  if (land.length === 0 && building.length === 0) {
    return 'Not Likely Vacant'
  } else if (land.length > 0) {
    return 'Likely Vacant Land'
  } else if (building.length > 0) {
    return 'Likely Vacant Building'
  }
}

// configure accounting.js
accounting.settings.currency.precision = 0;

Mapboard.default({
  // DEV
  // defaultAddress: '1234 MARKET ST',
  router: {
    enabled: true
  },
  geolocation: {
    enabled: false
  },
  rootStyle: {
    position: 'absolute',
    bottom: 0,
    // top: '78px',
    top: '118px',
    left: 0,
    right: 0,
  },
  map: {
    // possibly should move to base config
    defaultBasemap: 'pwd',
    defaultIdentifyFeature: 'address-marker',
    imagery: {
      enabled: true
    },
    historicBasemaps: {
      enabled: true
    },
  },
  baseConfig: BASE_CONFIG_URL,
  parcels: {
    pwd: {
      multipleAllowed: false,
      geocodeFailAttemptParcel: null,
      clearStateOnError: false,
      wipeOutOtherParcelsOnReverseGeocodeOnly: true,
      geocodeField: 'PARCELID',
      parcelIdInGeocoder: 'pwd_parcel_id',
      getByLatLngIfIdFails: false
    },
    dor: {
      multipleAllowed: true,
      geocodeFailAttemptParcel: 'pwd',
      clearStateOnError: true,
      wipeOutOtherParcelsOnReverseGeocodeOnly: false,
      geocodeField: 'MAPREG',
      parcelIdInGeocoder: 'dor_parcel_id',
      getByLatLngIfIdFails: true
    }
  },
  dataSources: {
    // nearby: {
    //   type: 'http-get',
    //   url: 'https://phl.carto.com/api/v2/sql',
    //   options: {
    //     params: {
    //       q: function(feature) {
    //         var aisX = feature.geometry.coordinates[0];
    //         var aisY = feature.geometry.coordinates[1];
    //         var table = 'incidents_part1_part2';
    //         var distanceFn = "ST_Distance(the_geom_webmercator, ST_Transform(CDB_LatLng(" + aisY + ", " + aisX + "), 3857)) * 3.28084";
    //         var where = distanceFn + ' < 500';
    //         //fieldMap = activityType.fieldMap,
    //         var select = ['ST_X(the_geom) as x',
    //                         'ST_Y(the_geom) as y',
    //                         distanceFn + "AS distance",
    //                       ].join(', ');
    //         query = ['SELECT', select, 'FROM', table, 'WHERE', where].join(' ');
    //         return (query);
    //         }
    //     },
    //     success(data) {
    //       return data
    //     }
    //   }
    // },
    opa: {
      type: 'http-get',
      url: 'https://data.phila.gov/resource/w7rb-qrn8.json',
      options: {
        params: {
          parcel_number: function(feature) { return feature.properties.opa_account_num; }
        },
        success: function(data) {
          return data[0];
        }
      }
    },
    // TODO elections and divisions
    // elections: {
    //   url: 'https://api.phila.gov/elections',
    //   type: 'http-get',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // }
    // divisions: {
    //   url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ServiceAreas/MapServer/22',
    //   type: 'http-get',
    //   params: {
    //
    //   },
    //   success(data) {
    //     return data;
    //   }
    // },
    stormwater: {
      type: 'http-get',
      url: 'https://api.phila.gov/stormwater',
      options: {
        params: {
          search: function(feature){ return feature.properties.street_address; }
        },
        success: function(data) {
          return data[0];
        }
      }
    },
    liPermits: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature){ return "select * from li_permits where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
        }
      }
    },
    liPermitsAdditional: {
      type: 'http-get',
      url: 'http://ase.phila.gov/arcgis/rest/services/GSG/GIS_LNI_LI_PERMITS_PLANNING/FeatureServer/0/query?',
      options: {
        params: {
          where: function(feature) {
            return "ADDRESS = '" + feature.properties.street_address + "' OR ADDRESSKEY = '" + feature.properties.li_address_key + "'"
          },
          outFields: '*',
          f: 'json'
        },
        success: function(data) {
          return data.features;
        },
      },
    },
    liInspections: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature){ return "select * from li_case_inspections where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
        }
      }
    },
    liViolations: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature){ return "select * from li_violations where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'"},
        }
      }
    },
    liBusinessLicenses: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature){ return "select * from li_business_licenses where street_address = '" + feature.properties.street_address + "'"},// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
        }
      }
    },
    zoningAppeals: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature) {
            var stmt = "select * from li_appeals where address = '" + feature.properties.street_address + "'";
            var addressKey = feature.properties.li_address_key;

            if (addressKey && addressKey.length > 0) {
              stmt += " or addresskey = '" + feature.properties.li_address_key.toString() + "'";
            }

            return stmt;
          }
        }
      }
    },
    zoningDocs: {
      type: 'http-get',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature) {
            // var stmt = "select * from zoning_documents_20170420 where address_std = '" + feature.properties.street_address + "'";

            var stmt = "select * from ais_zoning_documents where doc_id = ANY('{" + feature.properties.zoning_document_ids + "}'::text[])";

            // var stmt = "select * from ais_zoning_documents where doc_id in '"
            // for (i = 0; i < feature.properties.zoning_document_ids.length; i++) {
            //   stmt += feature.properties.zoning_document_ids[i] + "', '"
            // }
            // stmt += "']";

            // var addressKey = feature.properties.li_address_key;
            // if (addressKey && addressKey.length > 0) {
            //   stmt += " or addrkey = " + feature.properties.li_address_key;
            // }
            return stmt;
          }
        }
      }
    },
    // // TODO take zoningBase out and use AIS for base zoning district
    zoningBase: {
      type: 'esri',
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/6/',
      options: {
        relationship: 'contains',
      },
      success: function(data) {
        return data;
      }
    },
    rco: {
      type: 'esri',
      url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Zoning_RCO/FeatureServer/0',
      options: {
        relationship: 'contains',
      },
      // success(data) {
      //   // format phone numbers
      //   console.log('rco success', data);
      //
      //   var s2 = (""+s).replace(/\D/g, '');
      //   var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      //   return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
      //
      //   return data;
      // }
    },
    dorCondoList: {
      type: 'http-get',
      targets: {
        get: function(state) {
          return state.parcels.dor.data;
        },
        getTargetId: function(target) {
          return target.properties.OBJECTID;
        },
      },
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        params: {
          q: function(feature, state){
            console.log(state.parcels.dor.data[0].properties, 'mapreg', state.parcels.dor.data[0].properties.MAPREG);
            return "select * from condominium where mapref = '" + state.parcels.dor.data[0].properties.MAPREG + "'"
          },// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
        }
      }
    },
    dorDocuments: {
      type: 'http-get',
      targets: {
        get: function(state) {
          return state.parcels.dor.data;
        },
        getTargetId: function(target) {
          return target.properties.OBJECTID;
        },
      },
      // url: '//ase.phila.gov/arcgis/rest/services/RTT/MapServer/0/query',
      url: '//ase.phila.gov/arcgis/rest/services/DOR/rttsummary/MapServer/0/query',
      options: {
        params: {
          where: function(feature, state) {
            // METHOD 1: via address
            var parcelBaseAddress = concatDorAddress(feature);
            var geocode = state.geocode.data.properties;
            console.log('parcelBaseAddress', parcelBaseAddress)

            // REVIEW if the parcel has no address, we don't want to query
            // WHERE ADDRESS = 'null' (doesn't make sense), so use this for now
            if (!parcelBaseAddress || parcelBaseAddress === 'null'){
              var where = "MATCHED_REGMAP = '" + state.parcels.dor.data[0].properties.BASEREG + "'";
              console.log('DOR Parcel BASEREG', state.parcels.dor.data[0].properties.BASEREG);
            } else {
              const address_low = state.geocode.data.properties.address_low
              roundto100 = function(address) { return Math.floor(address/100, 1)*100}
              const address_floor = roundto100(address_low);
              const address_remainder = address_low - address_floor;
              console.log('address_low:', address_low, 'address_floor:', address_floor);
              var where = "((ADDRESS_LOW = " + address_low
                        + " OR (ADDRESS_LOW >= " + address_floor + " AND ADDRESS_LOW <= " + address_low + " AND ADDRESS_HIGH >= " + address_remainder + " ))"
                        + " AND STREET_NAME = '" + geocode.street_name
                        + "' AND STREET_SUFFIX = '" + geocode.street_suffix
                        + "'"
              if (geocode.street_predir != '') {
                where += " AND STREET_PREDIR = '" + geocode.street_predir + "'";
              }
              if (geocode.address_low_suffix != '') {
                where += " AND ADDRESS_LOW_SUFFIX = '" + geocode.address_low_suffix + "'";
              }
              if (geocode.street_postdir != '') {
                where += " AND STREET_POSTDIR = '" + geocode.street_postdir + "'";
              }
              // check for unit num
              var unitNum = cleanDorAttribute(feature.properties.UNIT);
              console.log('DOR Parcel BASEREG - feature:', feature);
              var unitNum2 = geocode.unit_num;
              if (unitNum) {
                where += " AND UNIT_NUM = '" + unitNum + "'";
              } else if (unitNum2 != '') {
                where += " AND UNIT_NUM = '" + unitNum2 + "'";
              }

              where += ") OR (STREET_ADDRESS='" + parcelBaseAddress + "'";
              if (unitNum) {
                where +="AND UNIT_NUM = '" + unitNum + "'";
              }
              where += ")"
            }

            // METHOD 2: via parcel id - the layer doesn't have mapreg yet, though
            // var mapreg = feature.properties.MAPREG;
            // var where = `MAPREG = '${mapreg}'`;

            // console.log('dor docs where', where);

            return where;
          },
          outFields: "R_NUM, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
          returnDistinctValues: 'true',
          returnGeometry: 'false',
          f: 'json'
        },
        success: function(data) {
          return data.features;
        }
      },
    },
    '311': {
      type: 'esri-nearby',
      url: 'http://192.168.103.143:6080/arcgis/rest/services/GSG/GIS311_365DAYS/MapServer/0',
      options: {
        geometryServerUrl: 'http://192.168.103.143:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer/',
        radius: 500,
        units: 'feet',
        calculateDistance: true,
      },
    },
    '311Carto': {
      type: 'http-get-nearby',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        table: 'public_cases_fc',
        dateMinNum: 1,
        dateMinType: 'year',
        dateField: 'requested_datetime',
        params: {},
      }
    },
    crimeIncidents: {
      type: 'http-get-nearby',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        table: 'incidents_part1_part2',
        dateMinNum: 1,
        dateMinType: 'year',
        dateField: 'dispatch_date',
        params: {},
      }
    },
    nearbyZoningAppeals: {
      type: 'http-get-nearby',
      url: 'https://phl.carto.com/api/v2/sql',
      options: {
        table: 'li_appeals',
        dateMinNum: 1,
        dateMinType: 'year',
        dateField: 'decisiondate',
        params: {}
      }
    },
    vacantLand: {
      type: 'esri',
      url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0',
      options: {
        relationship: 'contains',
      },
      // params: {
      //   query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Land/FeatureServer/0'}).contains(feature)
      // },
      success: function(data) {
        return data;
      }
    },
    vacantBuilding: {
      type: 'esri',
      url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Bldg/FeatureServer/0',
      options: {
        relationship: 'contains',
      },
      // params: {
      //   query: feature => L.esri.query({url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Vacant_Indicators_Bldg/FeatureServer/0'}).contains(feature)
      // },
      success: function(data) {
        return data;
      }
    },
    zoningOverlay: {
      type: 'esri',
      url: 'https://gis.phila.gov/arcgis/rest/services/PhilaGov/ZoningMap/MapServer/1/',
      options: {
        relationship: 'contains',
      },
      success: function(data) {
        return data;
      }
    },
    condoList: {
      type: 'http-get',
      url: 'http://api.phila.gov/ais/v1/search/',
      options: {
        params: {
          urlAddition: function(feature) {
            console.log('testing feature in params:', feature);
            const street_address = feature.properties.street_address;
            return street_address;
          },
          gatekeeperKey: GATEKEEPER_KEY,
          include_units: true,
          opa_only: true,
          page: 1,
        },
        success: function(data) {
          return data;
        }
      }
    },
    regmaps: {
      type: 'esri',
      url: '//gis.phila.gov/arcgis/rest/services/DOR_ParcelExplorer/rtt_basemap/MapServer/0',
      // deps: ['dorParcels'],
      deps: ['parcels.dor'],
      options: {
        relationship: 'intersects',
        targetGeometry: function(state, Leaflet) {
          // get combined extent of dor parcels
          // var parcels = state.dorParcels.data;
          var parcels = state.parcels.dor.data;
          // console.log('parcels', parcels);

          // build up sets of x and y values
          var xVals = [];
          var yVals = [];

          // loop over parcels
          for (var i=0; i < parcels.length; i++) {
            // console.log('parcels[i]', parcels[i])
            var coordSets = parcels[i].geometry.coordinates;
            // loop over coordinate sets
            for (var j=0; j < coordSets.length; j++) {
              // console.log('coordSets[j]', coordSets[j]);
              // loop over coordinates
              for (var k=0; k < coordSets[j].length; k++) {
                // console.log('coordSets[j][k]', coordSets[j][k]);
                var x = coordSets[j][k][0];
                var y = coordSets[j][k][1];

                xVals.push(x);
                yVals.push(y);
              }
            }
          }

          // take max/min
          var xMin = Math.min.apply(null, xVals);
          var xMax = Math.max.apply(null, xVals);
          var yMin = Math.min.apply(null, yVals);
          var yMax = Math.max.apply(null, yVals);

          // console.log('xVals', xVals, 'xMin', xMin, 'xMax', xMax);
          // console.log('yVals', yVals, 'yMin', yMin, 'yMax', yMax);

          // varruct geometry
          var bounds = L.latLngBounds([
            [yMin, xMin],
            [yMax, xMax]
          ]);

          return bounds;
        }
      },
      success: function(data) {
        return data;
      }
    },
  },
  imageOverlayGroups: {
    regmaps: {
      items: function(state) {
        // console.log('main.js imageOverlayGroups', state)
        return state.sources.regmaps.data;
      }
    }
  },
  legendControls: {
    water: {
      options: {
        topics: ['water'],
        showWithBaseMapOnly: false
      },
      data: {
        'Roof': {
          'background-color': '#FEFF7F',
        },
        'Other Impervious Surface': {
          'background-color': '#F2DCFF',
        }
      }
    },
    deeds: {
      options: {
        topics: ['deeds', 'zoning'],
        showWithBaseMapOnly: true
      },
      data: {
        'Easements': {
          'border-color': 'rgb(255, 0, 197)',
          'border-style': 'solid',
          'border-weight': '1px',
          'width': '12px',
          'height': '12px',
          'font-size': '10px',
        },
        'Transparcels': {
          'border-color': 'rgb(0, 168, 132)',
          'border-style': 'solid',
          'border-weight': '1px',
          'width': '12px',
          'height': '12px',
          'font-size': '10px',
        },
        'Rights of Way': {
          'border-color': 'rgb(249, 147, 0)',
          'border-style': 'solid',
          'border-weight': '1px',
          'width': '12px',
          'height': '12px',
          'font-size': '10px',
        }
      }
    }
  },
  // overlays: {
  //   '311': {
  //     type: 'point',
  //     dataSource: '311',
  //     options: {
  //       marker: 'circle',
  //       style: {
  //         radius: 6,
  //         fillColor: '#ff3f3f',
  //       	color: '#ff0000',
  //       	weight: 1,
  //       	opacity: 1,
  //       	fillOpacity: 1.0
  //       },
  //     },
  //   },
  //   'crimeIncidents': {
  //     type: 'point',
  //     dataSource: 'crimeIncidents',
  //     options: {
  //       marker: 'circle',
  //       style: {
  //         radius: 6,
  //         fillColor: '#477bd2',
  //       	color: '#477bd2',
  //       	weight: 1,
  //       	opacity: 1,
  //       	fillOpacity: 1.0
  //       },
  //     },
  //   },
  // },
  cyclomedia: {
    enabled: true
  },
  pictometry: {
    enabled: true
  },
  // reusable transforms for topic data. see `topics` section for usage.
  transforms: {
    currency: {
      // a list of global objects this transform depends on
      globals: ['accounting'],
      // this is the function that gets called to perform the transform
      transform: function(value, globals) {
        var accounting = globals.accounting;
        return accounting.formatMoney(value);
      }
    },
    date: {
      globals: ['moment'],
      transform: function(value, globals) {
        var moment = globals.moment;
        return moment(value).format('MM/DD/YYYY');
      }
    },
    phoneNumber: {
      transform: function(value) {
        var s2 = (""+value).replace(/\D/g, '');
        var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
        return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
      }
    },
    rcoPrimaryContact: {
      transform: function(value) {
        var PHONE_NUMBER_PAT = /\(?(\d{3})\)?( |-)?(\d{3})(-| )?(\d{4})/g;
        var m = PHONE_NUMBER_PAT.exec(value);

        // check for non-match
        if (!m) {
          return value;
        }

        // standardize phone number
        var std = ['(', m[1], ') ', m[3], '-', m[5]].join('');
        var orig = m[0]
        var valueStd = value.replace(orig, std);

        return valueStd;
      }
    },
    booleanToYesNo: {
      transform: function(value) {
        return value ? 'Yes' : 'No';
      }
    },
    thousandsPlace: {
      transform: function(value) {
        var number = String(value).match(/\d+/)[0].replace(/(.)(?=(\d{3})+$)/g,'$1,');
        var label = String(value).replace(/[0-9]/g, '') || '';
        return number + ' ' + label;
      }
    }
  },
  greeting:{
    initialMessage: '\
      <h2>CityAtlas connects you with information about any address in the city.</h2>\
      <p>Here are some things you can do with CityAtlas:</p>\
      <div class="callout">\
        <ul>\
          <li>Research real estate information including property values, zoning, and document archives</li>\
          <li>Get the history of permits, licenses, and inspections at any address</li>\
          <li>Easily access high-resolution street-level and aerial imagery</li>\
          <li>View activity around an address, including vacancy, crime, 311 service requests, and more</li>\
          <li>Explore historical imagery and maps</li>\
        </ul>\
      </div>\
      <p>To get started, click anywhere on the map, or type an address, intersection, OPA account number, or DOR Map Registry number into the search box.</p>\
    ',

  },
  topics: [
    {
      key: 'opa',
      icon: 'home',
      label: 'Assessments',
      // REVIEW can these be calculated from vue deps?
      dataSources: ['opa'],
      components: [
        {
          type: 'callout',
          slots: {
            // text: 'This information is provided by the Office of Property Assessments (OPA), the agency responsible for estimating property values in the City of Philadelphia. OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City websites may still use that name.'
            text: 'Property assessment and sale information. Source: Office of Property Assessments (OPA). OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.'
          }
        },

        // TODO - remove all of this code eventually, now that we are not using a table-group
        // {
        //   type: 'table-group',
        //   options: {
        //     alternate: {
        //       mainTable: {
        //         dataSource: 'opa',
        //         id:'opaData',
        //       },
        //       dependentTable: {
        //         dataSource: 'condoList',
        //         id: 'condoList',
        //       }
        //     },
        //     components: [

              // {
              //   type: 'horizontal-table',
              //   options: {
              //     topicKey: 'opa',
              //     id: 'condoList',
              //     useApiCount: true,
              //     // limit: 100,
              //     fields: [
              //       {
              //         label: 'OPA Account',
              //         value: function(state, item) {
              //           var url = window.location.origin + window.location.pathname + '#/' + item.properties.opa_account_num + '/opa'
              //           return "<a href="+url+">"+item.properties.opa_account_num+" <i class='fa fa-external-link'></i></a>";
              //         },
              //       },
              //       {
              //         label: 'Address',
              //         value: function(state, item) {
              //           var url = window.location.origin + window.location.pathname + '#/' + item.properties.opa_account_num + '/opa'
              //           return "<a href="+url+">"+item.properties.street_address+" <i class='fa fa-external-link'></i></a>";
              //         },
              //       },
              //       {
              //         label: 'Owners',
              //         value: function(state, item) {
              //           var owners = item.properties.opa_owners;
              //           var ownersJoined = owners.join(', ');
              //           return ownersJoined;
              //         }
              //       }
              //     ], // end fields
              //     // sort: {
              //     //   // this should return the val to sort on
              //     //   getValue: function(item) {
              //     //     // return item.attributes.RECORDING_DATE;
              //     //     return item.attributes.DOCUMENT_DATE;
              //     //   },
              //     //   // asc or desc
              //     //   order: 'desc'
              //     // }
              //   },
              //   slots: {
              //     title: 'Condominiums',
              //     highestPageRetrieved: function(state) { return state.sources['condoList'].data.page },
              //     pageCount: function(state) { return state.sources['condoList'].data.page_count },
              //     totalSize: function(state) { return state.sources['condoList'].data.total_size },
              //     items: function(state) {
              //       var data = state.sources['condoList'].data.features;
              //       var rows = data.map(function(row){
              //         var itemRow = row;
              //         return itemRow;
              //       });
              //       return rows;
              //     },
              //   } // end slots
              // },

        {
          type: 'vertical-table',
          slots: {
            fields: [
              {
                label: 'OPA Account #',
                value: function(state) {
                  return state.geocode.data.properties.opa_account_num;
                }
              },
              {
                label: 'OPA Address',
                value: function(state) {
                  return state.geocode.data.properties.opa_address;
                }
              },
              {
                label: 'Owners',
                value: function(state) {
                  var owners = state.geocode.data.properties.opa_owners;
                  var ownersJoined = owners.join(', ');
                  return ownersJoined;
                }
              },
              {
                label: 'Assessed Value ' + new Date().getFullYear(),
                value: function(state) {
                  var data = state.sources.opa.data;
                  // return data.market_value;
                  var result;
                  if (data) {
                    result = data.market_value;
                  } else {
                    result = 'no data';
                  }
                  return result;
                },
                transforms: [
                  'currency'
                ]
              },
              {
                label: 'Sale Date',
                value: function(state) {
                  var data = state.sources.opa.data;
                  // return data.sale_date;
                  var result;
                  if (data) {
                    result = data.sale_date;
                  } else {
                    result = 'no data';
                  }
                  return result;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Sale Price',
                value: function(state) {
                  var data = state.sources.opa.data;
                  // return data.sale_price;
                  var result;
                  if (data) {
                    result = data.sale_price;
                  } else {
                    result = 'no data';
                  }
                  return result;
                },
                transforms: [
                  'currency'
                ]
              },
            ],
          },
          options: {
            id: 'opaData',
            // requiredSources: ['opa'],
            externalLink: {
              action: function(count) {
                return 'See more';
              },
              name: 'Property Search',
              href: function(state) {
                var id = state.geocode.data.properties.opa_account_num;
                return '//property.phila.gov/?p=' + id;
              }
            }
          }
        }

        //     ]
        //   }
        // }
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'pwd',
      errorMessage: function(state) {
        if (state.sources.condoList.data){
          if (state.sources.condoList.data.features.length > 1) {
            return 'There is no OPA record for this address. Please select a condominum unit address below to see the record for that unit.';
          }
        }
        else {
          return 'There is no OPA record for this address.';
        }
      },
    },
    {
      key: 'condos',
      icon: 'map-marker',
      label: 'Condominiums',
      dataSources: ['condoList'],
      onlyShowTopicIfDataExists: {
        'condoList': {
          pathToDataArray: ['features'],
          minDataLength: 2,
        }
      },
      components: [
        {
          type: 'callout',
          slots: {
            text: 'Click any individual condominium unit below to see information on that unit.  Use the back button to get back to this list.'
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'condos',
            id: 'condoList',
            useApiCount: true,
            defaultIncrement: 25,
            fields: [
              {
                label: 'OPA Account',
                value: function(state, item) {
                  var url = window.location.origin + window.location.pathname + '#/' + item.properties.opa_account_num + '/opa'
                  return "<a href="+url+">"+item.properties.opa_account_num+" <i class='fa fa-external-link'></i></a>";
                  // console.log('value function item:', item, 'controller:', controller);
                  // return "<a onclick='" + controller + "'>"+item.properties.opa_account_num+"</a>"
                },
              },
              {
                label: 'Address',
                value: function(state, item) {
                  var url = window.location.origin + window.location.pathname + '#/' + item.properties.opa_account_num + '/opa'
                  return "<a href="+url+">"+item.properties.street_address+" <i class='fa fa-external-link'></i></a>";
                },
              },
            ], // end fields
            // sort: {
            //   // this should return the val to sort on
            //   getValue: function(item) {
            //     // return item.attributes.RECORDING_DATE;
            //     return item.attributes.DOCUMENT_DATE;
            //   },
            //   // asc or desc
            //   order: 'desc'
            // }
          },
          slots: {
            title: 'Condominiums',
            highestPageRetrieved: function(state) { return state.sources['condoList'].data.page },
            pageCount: function(state) { return state.sources['condoList'].data.page_count },
            totalSize: function(state) { return state.sources['condoList'].data.total_size },
            items: function(state) {
              var data = state.sources['condoList'].data.features;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          } // end slots
        },
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
      // TODO uncommenting this causes the no-content view to show up.
      // dataSources: ['dorDocuments'],
      components: [
        {
          type: 'callout',
          slots: {
            text: 'Deed information as maintained by the Department of Records. The map faithfully reflects property boundaries as described in recorded deeds including multiple types of easements. Click on Registry Maps to see images of the last hard-copy deed maps some of which have hand written information that may be useful in historical deed research.<br><br> \
                  The property boundaries displayed on the map are for reference only and should not be used in place of the recorded deeds or land surveys. Source: Department of Records'
          }
        },
        {
          type: 'collection-summary',
          options: {
            descriptor: 'parcel',
            // this will include zero quantities
            // includeZeroes: true,
            getValue: function(item) {
              return item.properties.STATUS;
            },
            context: {
              singular: function(list){ return 'There is ' + list + ' at this address.'},
              plural: function(list){ return 'There are ' + list + ' at this address.'}
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
            items: function(state) {
              // return state.dorParcels.data;
              return state.parcels.dor.data;
            }
          }
        },
        {
          type: 'tab-group',
          options: {
            getKey: function(item) {
              return item.properties.OBJECTID;
            },
            getTitle: function(item) {
              return item.properties.MAPREG;
            },
            getAddress: function(item) {
              const address = concatDorAddress(item);
              return address;
            },
            // components for the content pane. this essentially a topic body.
            components: [
            //   {
            //     type: 'table-group',
            //     options: {
            //       showBoth: {
            //         mainTable: {
            //           dataSource: null,
            //           id:'dorData',
            //         },
            //         dependentTable: {
            //           dataSource: 'condoList',
            //           id: 'condoList_dor',
            //         }
            //       },
            //       components: [

              {
                type: 'vertical-table',
                options: {
                  nullValue: 'None',
                  // id: 'dorData',
                },
                slots: {
                  title: 'Parcel Details',
                  fields: [
                    {
                      label: 'Map Registry #',
                      value: function(state, item) {
                        return item.properties.MAPREG;
                      },
                    },
                    {
                      label: 'Parcel Address',
                      value: function(state, item) {
                        return concatDorAddress(item);
                      },
                    },
                    {
                      label: 'Status',
                      value: function(state, item) {
                        var status = item.properties.STATUS;
                        var desc;
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
                      value: function(state, item) {
                        return item.properties.ORIG_DATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Inactive Date',
                      value: function(state, item) {
                        return item.properties.INACTDATE;
                      },
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Has Air Rights',
                      value: function(state, item) {
                        var suffix = item.properties.SUFFIX;
                        return suffix === 'A' ? 'Yes' : 'No';
                      },
                    },
                    {
                      label: 'Is Condo',
                      value: function(state, item) {
                        if (!item.properties.CONDOFLAG) {
                          return 'No';
                        } else {
                          return 'Yes';
                        }
                        // return item.properties.CONDOFLAG ? 'Yes' : 'No';
                      },
                      // fieldFunction: function(state, item) {
                      //   console.log('state', state);
                      // }
                    },
                    {
                      label: 'Perimeter',
                      value: function(state, item) {
                        return Math.round(item.properties['SHAPE.LEN']) + ' ft';
                      },
                      transforms: [
                        'thousandsPlace'
                      ]
                    },
                    {
                      label: 'Area',
                      value: function(state, item) {
                        return Math.round(item.properties['SHAPE.AREA']) + ' sq ft';
                      },
                      transforms: [
                        'thousandsPlace'
                      ]
                    },
                  ]
                }  // end slots
              },  // end vertical table
              // {
              //   type: 'horizontal-table',
              //   options: {
              //     topicKey: 'dor',
              //     id: 'condoList',
              //     shouldShowButton: true,
              //     useApiCount: true,
              //     // limit: 100,
              //     fields: [
              //       {
              //         label: 'OPA Account',
              //         value: function(state, item) {
              //           var url = window.location.origin + window.location.pathname + '#/' + item.properties.opa_account_num + '/opa'
              //           return "<a href="+url+">"+item.properties.opa_account_num+" <i class='fa fa-external-link'></i></a>";
              //         },
              //       },
              //       {
              //         label: 'Address',
              //         value: function(state, item) {
              //           var url = window.location.origin + window.location.pathname + '#/' + item.properties.opa_account_num + '/opa'
              //           return "<a href="+url+">"+item.properties.street_address+" <i class='fa fa-external-link'></i></a>";
              //         },
              //       },
              //       {
              //         label: 'Owners',
              //         value: function(state, item) {
              //           var owners = item.properties.opa_owners;
              //           var ownersJoined = owners.join(', ');
              //           return ownersJoined;
              //         }
              //       }
              //     ], // end fields
              //     // sort: {
              //     //   // this should return the val to sort on
              //     //   getValue: function(item) {
              //     //     // return item.attributes.RECORDING_DATE;
              //     //     return item.attributes.DOCUMENT_DATE;
              //     //   },
              //     //   // asc or desc
              //     //   order: 'desc'
              //     // }
              //   },
              //   slots: {
              //     title: 'Condominiums',
              //     highestPageRetrieved: function(state) { return state.sources['condoList'].data.page },
              //     pageCount: function(state) { return state.sources['condoList'].data.page_count },
              //     totalSize: function(state) { return state.sources['condoList'].data.total_size },
              //     items: function(state) {
              //       var data = state.sources['condoList'].data.features;
              //       var rows = data.map(function(row){
              //         var itemRow = row;
              //         return itemRow;
              //       });
              //       return rows;
              //     },
              //   } // end slots
              // },

              //     ]
              //   }
              // },
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'deeds',
                  id: 'dorCondoList',
                  defaultIncrement: 10,
                  showAllRowsOnFirstClick: true,
                  showOnlyIfData: true,
                  fields: [
                    {
                      label: 'Condo Parcel',
                      value: function(state, item) {
                        return item.recmap + '-' + item.condoparcel;
                      },
                    },
                    {
                      label: 'Condo Name',
                      value: function(state, item) {
                        // return item.attributes.RECORDING_DATE;
                        return item.condo_name;
                      },
                    },
                    {
                      label: 'Unit #',
                      value: function(state, item) {
                        return 'Unit #' + item.condounit;
                      },
                    },
                    // {
                    //   label: 'Grantor',
                    //   value: function(state, item) {
                    //     return item.attributes.GRANTORS;
                    //   },
                    // },
                    // {
                    //   label: 'Grantee',
                    //   value: function(state, item) {
                    //     return item.attributes.GRANTEES;
                    //   },
                    // },
                  ], // end fields
                  sort: {
                    // this should return the val to sort on
                    getValue: function(item) {
                      // return item.attributes.RECORDING_DATE;
                      return item.condounit;
                    },
                    // asc or desc
                    order: 'asc'
                  }
                },
                slots: {
                  title: 'DOR Condominium Records',
                  items: function(state, item) {
                    console.log('dorcondo item', item);
                    var id = item.properties.OBJECTID;
                    if (state.sources.dorCondoList.targets[id]) {
                      if (state.sources.dorCondoList.targets[id].data) {
                        return state.sources.dorCondoList.targets[id].data.rows;
                      }
                    } else {
                      return [];
                    }
                  },
                } // end slots
              }, // end condos table

              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'deeds',
                  id: 'dorDocuments',
                  defaultIncrement: 25,
                  fields: [
                    {
                      label: 'ID',
                      value: function(state, item) {
                        return "<a target='_blank' href='//pdx-app01/recorder/eagleweb/viewDoc.jsp?node=DOCC"+item.attributes.R_NUM+"'>"+item.attributes.R_NUM+"<i class='fa fa-external-link'></i></a>"
                      },
                    },
                    {
                      label: 'Date',
                      value: function(state, item) {
                        // return item.attributes.RECORDING_DATE;
                        return item.attributes.DISPLAY_DATE;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Type',
                      value: function(state, item) {
                        return item.attributes.DOCUMENT_TYPE;
                      },
                    },
                    {
                      label: 'Grantor',
                      value: function(state, item) {
                        return item.attributes.GRANTORS;
                      },
                    },
                    {
                      label: 'Grantee',
                      value: function(state, item) {
                        return item.attributes.GRANTEES;
                      },
                    },
                  ], // end fields
                  sort: {
                    // this should return the val to sort on
                    getValue: function(item) {
                      // return item.attributes.RECORDING_DATE;
                      return item.attributes.DISPLAY_DATE;
                    },
                    // asc or desc
                    order: 'desc'
                  }
                },
                slots: {
                  title: 'Documents',
                  // defaultIncrement: 25,
                  items: function(state, item) {
                    var id = item.properties.OBJECTID;
                    if (state.sources.dorDocuments.targets[id]) {
                      return state.sources.dorDocuments.targets[id].data;
                    } else {
                      return [];
                    }
                  },
                } // end slots

                // slots: {
                //   title: 'Condominiums',
                //   highestPageRetrieved: function(state) { return state.sources['condoList'].data.page },
                //   pageCount: function(state) { return state.sources['condoList'].data.page_count },
                //   totalSize: function(state) { return state.sources['condoList'].data.total_size },
                //   items: function(state) {
                //     var data = state.sources['condoList'].data.features;
                //     var rows = data.map(function(row){
                //       var itemRow = row;
                //       return itemRow;
                //     });
                //     return rows;
                //   },
                // } // end slots

              }, // end docs table
            ] // end parcel tab content comps
          }, // end parcel tab options
          slots: {
            items: function(state) {
              // return state.dorParcels.data;
              return state.parcels.dor.data;
            }
          }
        }, // end dor parcel tab group comp
        {
          type: 'overlay-toggle-group',
          options: {
            getKey: function(item) {
              return item.properties.RECMAP;
            },
          },
          slots: {
            title: 'Registry Maps',
            items: function(state) {
              return state.sources.regmaps.data;
            }
          }
        },
        // {
        //   type: 'callout',
        //   slots: {
        //     text: 'The property boundaries displayed on the map are for reference only and may not be used in place of recorded deeds or land surveys. Source: Department of Records.'
        //   }
        // }
      ], // end deeds comps
      basemap: 'dor',
      identifyFeature: 'dor-parcel',
      // identifyFeature: 'address-marker',
      // we might not need this anymore, now that we have identifyFeature
      parcels: 'dor',
      // parcels: 'pwd'
      imageOverlayGroup: 'regmaps',
    },
    {
      key: 'permits',
      icon: 'wrench',
      label: 'Permits',
      dataSources: [
        'liPermits',
        'liInspections',
        'liViolations',
        'liBusinessLicenses'
      ],
      components: [
        {
          type: 'callout',
          slots: {
            text: 'Building permits, licenses, property maintenance code violations. Source: Department of Licenses and Inspections.'
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liPermits',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.permitissuedate
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=permits&eid="+item.permitnumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.permitnumber+" <i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.permitdescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.permitissuedate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older permits at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return '//li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Permits',
            items: function(state) {
              var data = state.sources['liPermits'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liInspections',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.inspectioncompleted
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
                  // return item.casenumber
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.inspectiondescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.inspectionstatus
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.inspectioncompleted;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                // return `See ${count} older inspections at L&I Property History`;
                return 'See ' + count + ' older inspections at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return '//li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Inspections',
            items: function(state) {
              var data = state.sources['liInspections'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liViolations',
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.caseaddeddate
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
                  // return item.casenumber
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.violationdescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.caseaddeddate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older violations at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return '//li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Violations',
            items: function(state) {
              var data = state.sources['liViolations'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liBusinessLicenses',
            limit: 5,
            fields: [
              {
                label: 'Issue Date',
                value: function(state, item){
                  return item.initialissuedate
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'License Number',
                value: function(state, item){
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=licenses&eid="+item.licensenum+"&key="+item.street_address+"&address="+item.street_address+"'>"+item.licensenum+" <i class='fa fa-external-link'></i></a>"
                  return item.licensenum
                }
              },
              {
                label: 'Name',
                value: function(state, item){
                  return item.business_name
                }
              },
              {
                label: 'Type',
                value: function(state, item){
                  return item.licensetype
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.licensestatus
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.caseaddeddate;
              },
              // asc or desc
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older business licenses at L&I Property History';
              },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return '//li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          },
          slots: {
            title: 'Business Licenses',
            items: function(state) {
              var data = state.sources['liBusinessLicenses'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'permits',
            id: 'liPermitsAdditional',
            defaultIncrement: 25,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.attributes.PERMITISSUEDATE
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=permits&eid="+item.attributes.PERMITNUMBER+"&key="+item.attributes.ADDRESSKEY+"&address="+item.attributes.ADDRESS+"'>"+item.attributes.PERMITNUMBER+" <i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Building Area',
                value: function(state, item){
                  return item.attributes.BLDGAREA
                },
                nullValue: 'no area available',
                transforms: [
                  'thousandsPlace'
                ]
              },
              {
                label: 'Declared Value',
                value: function(state, item){
                  return item.attributes.DECLAREDVALUE
                },
                nullValue: 'no value available',
                transforms: [
                  'currency'
                ]
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.attributes.PERMITISSUEDATE;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title: 'Building Area and Value',
            items: function(state) {
              var data = state.sources['liPermitsAdditional'].data;
              if (data === null || data === undefined) {
                return;
              }
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        }
        // {
        //   type: 'horizontal-table',
        //   options: {
        //     topicKey: 'permits',
        //     id: 'liPermitsAdditional',
        //     defaultIncrement: 25,
        //     fields: [
        //       {
        //         label: 'Date',
        //         value: function(state, item){
        //           return item.attributes.PERMITISSUEDATE
        //         },
        //         nullValue: 'no date available',
        //         transforms: [
        //           'date'
        //         ]
        //       },
        //       {
        //         label: 'ID',
        //         value: function(state, item){
        //           return "<a target='_blank' href='//li.phila.gov/#details?entity=permits&eid="+item.attributes.PERMITNUMBER+"&key="+item.attributes.ADDRESSKEY+"&address="+item.attributes.ADDRESS+"'>"+item.attributes.PERMITNUMBER+" <i class='fa fa-external-link'></i></a>"
        //         }
        //       },
        //       {
        //         label: 'Building Area',
        //         value: function(state, item){
        //           return item.attributes.BLDGAREA
        //         },
        //         nullValue: 'no area available',
        //         transforms: [
        //           'thousandsPlace'
        //         ]
        //       },
        //       {
        //         label: 'Declared Value',
        //         value: function(state, item){
        //           return item.attributes.DECLAREDVALUE
        //         },
        //         nullValue: 'no value available',
        //         transforms: [
        //           'currency'
        //         ]
        //       },
        //     ],
        //     sort: {
        //       // this should return the val to sort on
        //       getValue: function(item) {
        //         return item.attributes.PERMITISSUEDATE;
        //       },
        //       // asc or desc
        //       order: 'desc'
        //     },
        //   },
        //   slots: {
        //     title: 'Building Area and Value',
        //     items: function(state) {
        //       var data = state.sources['liPermitsAdditional'].data;
        //       if (data === null) {
        //         return;
        //       }
        //       var rows = data.map(function(row){
        //         var itemRow = row;
        //         // var itemRow = Object.assign({}, row);
        //         //itemRow.DISTANCE = 'TODO';
        //         return itemRow;
        //       });
        //       // console.log('rows', rows);
        //       return rows;
        //     },
        //   },
        // }
      ],
      basemap: 'pwd',
      dynamicMapLayers: [
        //'zoning'
      ],
      identifyFeature: 'address-marker',
      parcels: 'pwd'
    },
    {
      key: 'zoning',
      icon: 'building-o',
      label: 'Zoning',
      dataSources: [
        'zoningOverlay'
      ],
      components: [
        {
          type: 'callout',
          slots: {
            text: 'Base district zoning maps and associated zoning overlays and Registered Community Organizations. Source: Department of Planning and Development'
          }
        },
        {
          type: 'badge',
          options: {
            titleBackground: '#58c04d'
          },
          slots: {
            title: 'Base District',
            value: function(state) {
              return state.geocode.data.properties.zoning;
            },
            description: function(state) {
              var code = state.geocode.data.properties.zoning;
              return ZONING_CODE_MAP[code];
            },
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningOverlay',
            // limit: 100,
            fields: [
              {
                label: 'Name',
                value: function(state, item){
                  return item.properties.OVERLAY_NAME
                }
              },
              {
                label: 'Code Section',
                value: function(state, item){
                  // return item.properties.CODE_SECTION
                  return "<a target='_blank' href='"+item.properties.CODE_SECTION_LINK+"'>"+item.properties.CODE_SECTION+" <i class='fa fa-external-link'></i></a>"
                }
              },
            ],
          },
          slots: {
            title: 'Overlays',
            items: function(state) {
              var data = state.sources['zoningOverlay'].data
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                //itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              // console.log('rows', rows);
              return rows;
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningAppeals',
            // limit: 100,
            fields: [
              {
                label: 'Processed Date',
                value: function(state, item) {
                  return item.processeddate;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  //return item.appeal_key
                  // return "<a target='_blank' href='//li.phila.gov/#details?entity=violationdetails&eid="+item.casenumber+"&key="+item.addresskey+"&address="+item.address+"'>"+item.casenumber+" <i class='fa fa-external-link'></i></a>"
                  return "<a target='_blank' href='//li.phila.gov/#details?entity=appeals&eid="+item.appeal_key+"&key="+item.addresskey+"&address="+item.address+"'>"+item.appealno+"<i class='fa fa-external-link'></i></a>"
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.appealgrounds;
                }
              },
              {
                label: 'Scheduled Date',
                value: function(state, item) {
                  return item.date_scheduled;
                },
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Status',
                value: function(state, item){
                  // return item.properties.CODE_SECTION
                  return item.decision
                }
              },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.date_scheduled;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title : 'Appeals',
            items: function(state) {
              if (state.sources['zoningAppeals'].data) {
                if (state.sources['zoningAppeals'].data.rows) {
                  var data = state.sources['zoningAppeals'].data.rows;
                  var rows = data.map(function(row){
                    var itemRow = row;
                    // var itemRow = Object.assign({}, row);
                    //itemRow.DISTANCE = 'TODO';
                    return itemRow;
                  });
                  return rows;
                }
              }
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'zoningDocs',
            // limit: 100,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.scan_date
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return "<a target='_blank' href='//www.phila.gov/zoningarchive/Preview.aspx?address="
                          + item.address
                          + "&&docType="
                          + item.doc_type
                          + "&numofPages="
                          + item.num_pages
                          + "&docID="
                          + item.app_doc_id
                          + "&app="
                          + item.app_id
                          +"'>"
                          // + item.app_id + '-'
                          + item.doc_id + ' '
                          + "<i class='fa fa-external-link'></i></a>"
                  // return item.appid + '-' + item.docid
                }
              },
              {
                label: 'Type',
                value: function(state, item){
                  return item.doc_type
                }
              },
              {
                label: '# Pages',
                value: function(state, item){
                  return item.num_pages
                }
              },
              // {
              //   label: 'Link',
              //   value: function(state, item){
              //     // return "<a href='//www.washingtonpost.com/'>View Scan</a>"
              //     return "<a target='_blank' href='//www.phila.gov/zoningarchive/Preview.aspx?address=" + item.address + "&&docType=" + item.doctype + "&numofPages=" + item.page_numbers + "&docID=" + item.docid + "&app=" + item.appid +"'>View Scan <i class='fa fa-external-link'></i></a>"
              //   }
              // },
            ],
            sort: {
              // this should return the val to sort on
              getValue: function(item) {
                return item.scandate;
              },
              // asc or desc
              order: 'desc'
            },
          },
          slots: {
            title: 'Archived Documents',
            subtitle: 'aka "Zoning Archive"',
            items: function(state) {
              if (state.sources['zoningDocs'].data) {
                if (state.sources['zoningDocs'].data.rows) {
                  var data = state.sources['zoningDocs'].data.rows;
                  var rows = data.map(function(row){
                    var itemRow = row;
                    // var itemRow = Object.assign({}, row);
                    //itemRow.DISTANCE = 'TODO';
                    return itemRow;
                  });
                  return rows;
                }
              }
            },
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'zoning',
            id: 'rco',
            // limit: 100,
            fields: [
              {
                label: 'RCO',
                value: function(state, item) {
                  return '<b>' + item.properties.ORGANIZATION_NAME + '</b><br>'
                  + item.properties.ORGANIZATION_ADDRESS
                },
              },
              {
                label: 'Meeting Address',
                value: function(state, item) {
                  return item.properties.MEETING_LOCATION_ADDRESS
                }
              },
              {
                label: 'Primary Contact',
                value: function(state, item) {
                  // return item.properties.PRIMARY_PHONE
                  return item.properties.PRIMARY_NAME + '<br>'
                  + item.properties.PRIMARY_PHONE + '<br>'
                  // + `<b><a :href="'mailto:' + item.properties.PRIMARY_EMAIL">`
                  + item.properties.PRIMARY_EMAIL// + '</a></b>'
                },
                transforms: [
                  'rcoPrimaryContact'
                ]
              },
              {
                label: 'Preferred Method',
                value: function(state, item){
                  return item.properties.PREFFERED_CONTACT_METHOD
                }
              },
            ],
            externalLink: {
              forceShow: true,
              action: function() {
                return 'See a list of all RCOs in the city [PDF]';
              },
              name: '',
              href: function(state) {
                // var address = state.geocode.data.properties.street_address;
                // var addressEncoded = encodeURIComponent(address);
                return '//www.phila.gov/CityPlanning/projectreviews/RCO%20Related/List_of_RCOs.pdf';
              }
            }
          },
          slots: {
            title: 'Registered Community Organizations',
            items: function(state) {
              if (state.sources['rco'].data) {
                var data = state.sources['rco'].data;
                var rows = data.map(function(row){
                  var itemRow = row;
                  // var itemRow = Object.assign({}, row);
                  return itemRow;
                });
                return rows;
              }
            },
          },
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
      key: 'vacancy',
      icon: 'map-marker',
      label: 'Vacancy',
      dataSources: ['vacantLand', 'vacantBuilding', '311Carto', 'crimeIncidents', 'nearbyZoningAppeals'],
      basemap: 'pwd',
      featureLayers: [
        'vacantLand',
        'vacantBuilding'
      ],
      identifyFeature: 'address-marker',
      parcels: 'pwd',
      // TODO implement this
      // computed: {
      //   label(state) {
      //     var land = state.sources.vacantLand.data
      //     var building = state.sources.vacantBuilding.data
      //     if (land.length === 0 && building.length === 0) {
      //       return 'Not Likely Vacant';
      //     } else if (land.length > 0) {
      //       return 'Likely Vacant Land';
      //     } else if (building.length > 0) {
      //       return 'Likely Vacant Building';
      //     }
      //   }
      // },
      components: [
        {
          type: 'callout',
          slots: {
            text: 'See 311 requests, neighborhood services, vacant property and more in the last 30 or 90 days near your search address. Filter or sort by records.'
          }
        },
        {
          type: 'badge',
          options: {
            titleBackground: function(state) {
              var text = getVacancyText(state);
              if (text.includes('Land')) {
                return 'orange';
              } else if (text.includes('Building')) {
                return 'purple';
              } else {
                return '#58c04d';
              }
            }
          },
          slots: {
            title: 'Vacancy',
            value: function(state) {
              return getVacancyText(state);
            },
            // description: function(state) {
            //   var code = state.geocode.data.properties.zoning;
            //   return ZONING_CODE_MAP[code];
            // },
          }
        },
        {
          type: 'table-group',
          options: {
            filters: [
              {
                type: 'data',
                getValue: function(item) {
                  return item;
                },
                label: 'What nearby activity would you like to see?',
                values: [
                  {
                    label: '311 Requests',
                    value: '311',
                  },
                  {
                    label: 'Crime Incidents',
                    value: 'crimeIncidents',
                  },
                  {
                    label: 'Zoning Appeals',
                    value: 'nearbyZoningAppeals',
                  }
                ]
              },
            ],
            // components for the content pane.
            components: [
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'vacancy',
                  id: '311',
                  sort: {
                    select: true,
                    getValue: function(item, method) {
                      var val;

                      if (method === 'date') {
                        val = item.requested_datetime;
                      } else if (method === 'distance') {
                        val = item.distance;
                      }

                      return val;
                    }
                  },
                  filters: [
                    {
                      type: 'time',
                      getValue: function(item) {
                        return item.requested_datetime;
                      },
                      label: 'From the last',
                      values: [
                        {
                          label: '30 days',
                          value: '30',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: '90 days',
                          value: '90',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: 'year',
                          value: '1',
                          unit: 'years',
                          direction: 'subtract',
                        }
                      ]
                    }
                  ],
                  filterByText: {
                    label: 'Filter by',
                    fields: [
                      'service_name',
                      'address'
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#ff3f3f',
                    	color: '#ff0000',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#ff0000',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.requested_datetime;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Address',
                      value: function(state, item) {
                        return item.address;
                      }
                    },
                    {
                      label: 'Subject',
                      value: function(state, item) {
                        if (item.media_url) {
                          return '<a target="_blank" href='+item.media_url+'>'+item.service_name+'</a>';
                        } else {
                          return item.service_name;
                        }
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Nearby Service Requests',
                  data: '311',
                  items: function(state) {
                    var data = state.sources['311Carto'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                }
              },
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'vacancy',
                  id: 'crimeIncidents',
                  sort: {
                    select: true,
                    getValue: function(item, method) {
                      var val;

                      if (method === 'date') {
                        val = item.dispatch_date;
                      } else if (method === 'distance') {
                        val = item.distance;
                      }

                      return val;
                    }
                  },
                  filters: [
                    {
                      type: 'time',
                      getValue: function(item) {
                        return item.dispatch_date;
                      },
                      label: 'From the last',
                      values: [
                        {
                          label: '30 days',
                          value: '30',
                          unit: 'days',
                          direction: 'subtract',
                        },
                        {
                          label: '90 days',
                          value: '90',
                          unit: 'days',
                          direction: 'subtract',
                        },
                      ]
                    }
                  ],
                  filterByText: {
                    label: 'Filter by',
                    fields: [
                      'text_general_code',
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#6674df',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#6674df',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.dispatch_date;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Location',
                      value: function(state, item) {
                        return item.location_block;
                      }
                    },
                    {
                      label: 'Description',
                      value: function(state, item) {
                        return item.text_general_code;
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Crime Incidents',
                  data: 'crimeIncidents',
                  items: function(state) {
                    var data = state.sources['crimeIncidents'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
              {
                type: 'horizontal-table',
                options: {
                  topicKey: 'vacancy',
                  id: 'nearbyZoningAppeals',
                  sort: {
                    select: true,
                    getValue: function(item, method) {
                      var val;

                      if (method === 'date') {
                        val = item.decisiondate;
                      } else if (method === 'distance') {
                        val = item.distance;
                      }

                      return val;
                    }
                  },
                  filterByText: {
                    label: 'Filter by',
                    fields: [
                      'appealgrounds'
                    ]
                  },
                  mapOverlay: {
                    marker: 'circle',
                    style: {
                      radius: 6,
                      fillColor: '#009900',
                    	color: '#009900',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    },
                    hoverStyle: {
                      radius: 6,
                      fillColor: 'yellow',
                    	color: '#009900',
                    	weight: 1,
                    	opacity: 1,
                    	fillOpacity: 1.0
                    }
                  },
                  fields: [
                    {
                      label: 'Date',
                      value: function(state, item) {
                        return item.decisiondate;
                      },
                      nullValue: 'no date available',
                      transforms: [
                        'date'
                      ]
                    },
                    {
                      label: 'Location',
                      value: function(state, item) {
                        return item.address;
                      }
                    },
                    {
                      label: 'Description',
                      value: function(state, item) {
                        return item.appealgrounds;
                      }
                    },
                    {
                      label: 'Distance',
                      value: function(state, item) {
                        return parseInt(item.distance) + ' ft';
                      }
                    }
                  ]
                },
                slots: {
                  title: 'Zoning Appeals',
                  data: 'nearbyZoningAppeals',
                  items: function(state) {
                    var data = state.sources['nearbyZoningAppeals'].data || [];
                    var rows = data.map(function(row){
                      var itemRow = row;
                      // var itemRow = Object.assign({}, row);
                      return itemRow;
                    });
                    return rows;
                  },
                } // end of slots
              }, // end of horizontal-table
            ], // end comps
          }, // end options
          slots: {
            // REVIEW should this go in options? maybe not, since it should be
            // reactive.
            items: function(state) {
              // return state.pwdParcel;
              return state.parcel.pwd
            }
          },
        }
      ]
    },
    {
      key: '311',
      icon: 'phone',
      label: '311',
      dataSources: ['311'],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
      parcels: 'pwd',
      components: [
        {
          type: 'callout',
          slots: {
            text: 'A more detailed look at 311 requests near the search address that includes records marked private by the public and Description field content that cannot be shared with the public.'
          }
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: '311',
            id: '311',
            sort: {
              select: true,
              getValue: function(item, method) {
                var val;

                if (method === 'date') {
                  val = item.properties.REQUESTED_DATETIME;
                } else if (method === 'distance') {
                  val = item._distance;
                }

                return val;
              }
            },
            filters: [
              {
                type: 'time',
                getValue: function(item) {
                  return item.properties.REQUESTED_DATETIME;
                },
                label: 'From the last',
                values: [
                  {
                    label: '30 days',
                    value: '30',
                    unit: 'days',
                    direction: 'subtract',
                  },
                  {
                    label: '90 days',
                    value: '90',
                    unit: 'days',
                    direction: 'subtract',
                  },
                  {
                    label: 'year',
                    value: '1',
                    unit: 'years',
                    direction: 'subtract',
                  }
                ]
              }
            ],
            filterByText: {
              label: 'Filter by',
              fields: [
                'DESCRIPTION',
                'SUBJECT',
                'ADDRESS'
              ]
            },
            mapOverlay: {
              marker: 'circle',
              style: {
                radius: 6,
                fillColor: '#ff3f3f',
              	color: '#ff0000',
              	weight: 1,
              	opacity: 1,
              	fillOpacity: 1.0
              },
              hoverStyle: {
                radius: 6,
                fillColor: 'yellow',
              	color: '#ff0000',
              	weight: 1,
              	opacity: 1,
              	fillOpacity: 1.0
              }
            },
            fields: [
              {
                label: 'Date',
                value: function(state, item) {
                  return item.properties.REQUESTED_DATETIME;
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'Address',
                value: function(state, item) {
                  return item.properties.ADDRESS;
                }
              },
              {
                label: 'Subject',
                value: function(state, item) {
                  if (item.properties.MEDIA_URL) {
                    return '<a target="_blank" href='+item.properties.MEDIA_URL+'>'+item.properties.SUBJECT+'</a>';
                  } else {
                    return item.properties.SUBJECT;
                  }
                }
              },
              {
                label: 'Description (not shared with the public)',
                value: function(state, item) {
                  return item.properties.DESCRIPTION;
                }
              },
              {
                label: 'Distance',
                value: function(state, item) {
                  // return `${item._distance} ft`;
                  return item._distance + ' ft';
                }
              }
            ]
          },
          slots: {
            title: 'Nearby Service Requests',
            items: function(state) {
              var data = state.sources['311'].data;
              var rows = data.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                // itemRow.DISTANCE = 'TODO';
                return itemRow;
              });
              return rows;
            },
            // filterText() {
            //   return 'from the last';
            // },
            // filterValues: {
            //   value1: {
            //     text: '30 days',
            //     value: '30'
            //   },
            //   value2: {
            //     text: '90 days',
            //     value: '90'
            //   },
            //   value3: {
            //     text: 'year',
            //     value: '365'
            //   }
            // },
          }
        }
      ]
    },
    {
      key: 'water',
      icon: 'tint',
      label: 'Stormwater',
      dataSources: ['stormwater'],
      basemap: 'pwd',
      dynamicMapLayers: [
        'stormwater'
      ],
      identifyFeature: 'pwd-parcel',
      parcels: 'pwd',
      components: [
        {
          type: 'callout',
          slots: {
            text: 'The property boundaries displayed on the map for reference only and may not be used in place of recorded deeds or land surveys. Boundaries are generalized for ease of visualization. Source: Philadelphia Water'
          }
        },
        {
          type: 'vertical-table',
          slots: {
            title: 'Parcel',
            fields: [
              {
                label: 'Parcel ID',
                value: function(state) {
                  // return state.geocode.data.properties.pwd_parcel_id;
                  return state.sources.stormwater.data.Parcel.ParcelID;
                }
              },
              {
                label: 'Address',
                value: function(state) {
                  return state.sources.stormwater.data.Parcel.Address;
                }
              },
              {
                label: 'Building Type',
                value: function(state) {
                  return state.sources.stormwater.data.Parcel.BldgType;
                }
              },
              {
                label: 'Gross Area',
                value: function(state) {
                  return state.sources.stormwater.data.Parcel.GrossArea + ' sq ft';
                },
                transforms: [
                  'thousandsPlace'
                ]
              },
              {
                label: 'Impervious Area',
                value: function(state) {
                  return state.sources.stormwater.data.Parcel.ImpervArea + ' sq ft';
                },
                transforms: [
                  'thousandsPlace'
                ]
              },
              {
                label: 'CAP Eligible',
                value: function(state) {
                  return state.sources.stormwater.data.Parcel.CAPEligible;
                },
                transforms: [
                  'booleanToYesNo'
                ]
              },
            ]
          },
        },
        {
          type: 'horizontal-table',
          options: {
            topicKey: 'water',
            id: 'stormwater',
            // limit: 100,
            // TODO this isn't used yet, but should be for highlighting rows/
            // map features.
            // overlay: '311',
            fields: [
              {
                label: 'Account #',
                value: function(state, item) {
                  return item.AccountNumber;
                }
              },
              {
                label: 'Customer',
                value: function(state, item) {
                  return item.CustomerName;
                }
              },
              {
                label: 'Status',
                value: function(state, item) {
                  return item.AcctStatus;
                }
              },
              {
                label: 'Service Type',
                value: function(state, item) {
                  return item.ServiceTypeLabel;
                }
              },
              {
                label: 'Size',
                value: function(state, item) {
                  return item.MeterSize;
                }
              },
              {
                label: 'Stormwater',
                value: function(state, item) {
                  return item.StormwaterStatus;
                }
              }
            ],
            externalLink: {
              forceShow: true,
              action: function(count) {
                return 'See more at Stormwater Billing';
              },
              name: 'Stormwater Billing',
              href: function(state) {
                var id = state.sources.stormwater.data.Parcel.ParcelID;
                return '//www.phila.gov/water/swmap/Parcel.aspx?parcel_id=' + id;
              }
            }
          },
          slots: {
            title: 'Accounts',
            items: function(state) {
              var data = state.sources['stormwater'].data
              var rows = data.Accounts.map(function(row){
                var itemRow = row;
                // var itemRow = Object.assign({}, row);
                return itemRow;
              });
              return rows;
            }
          }
        }
      ]
    },
    // {
    //   key: 'related',
    //   icon: 'home',
    //   label: 'Related Addresses',
    //   components: [
    //     // {
    //     //   type: 'callout',
    //     //   slots: {
    //     //     text: 'This information is a test.'
    //     //   }
    //     // },
    //     {
    //       type: 'list',
    //       slots: {
    //         relatedAddresses: function(state) {
    //           if (state.geocode.related.length > 0) {
    //             return state.geocode.related;
    //           } else {
    //             return false;
    //           }
    //         }
    //       }
    //     }
    //   ],
    // }
  ],
  // events: {
  //   geocodeResult(e) {
  //     console.log('**HOST** geocode result:', e.properties.street_address);
  //   }
  // }

});
