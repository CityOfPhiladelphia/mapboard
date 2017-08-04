var BASE_CONFIG_URL = '//rawgit.com/rbrtmrtn/mapboard-base-config/124cf29c3c145199447bd04cf8cc93108e95872c/config.js',
    GATEKEEPER_KEY = '77e78967d0a3e768432f74132f784f42';

// TODO get user-entered address
// var searchInput = '1300 market street';

// mapping of rco polygon object ids to names
var RCO_NAMES = {
  10409: "Melrose Civic Association",
  10410: "Passyunk Square Civic Association",
  10411: "Fairmount Civic Association",
  10412: "Old City District",
  10407: "Seventh Street Community Civic Association",
  10413: "Central Delaware Advocacy Group (CDAG)",
  10408: "Residents of Shawmont Valley Association",
  10420: "50th Democratic Ward",
  10421: "22nd Republican Ward",
  10422: "Faith Community Development Corporation (FCDC)",
  10423: "Nueva Esperanza Housing and Economic Development",
  10424: "Tioga United, Inc.",
  10425: "RAH Civic Association",
  10426: "Ridge Park Civic Association",
  10427: "North Penn Community Action Council",
  10428: "Callowhill Neighborhood Association",
  10429: "Parkside Association",
  10430: "Somerton Civic Association",
  10431: "Baynton Hill Neighbors",
  10432: "9th Republican Ward",
  10433: "Fishtown Neighbors Association",
  10434: "Powelton Village Civic Association",
  10435: "Spruce Hill Community Association",
  10436: "Central Roxborough Civic Association (CRCA)",
  10437: "Eastwick Friends & Neighbors Coalition",
  10438: "29th Republican Ward",
  10439: "South of South Neighborhood Association (SOSNA)",
  10440: "East Torresdale Civic Association",
  10441: "Center City Residents Association (CCRA)",
  10442: "Cedar Park Neighbors",
  10443: "Belmont Alliance Civic Association CDC",
  10444: "North East Quality of Life Coalition",
  10445: "Kensington Independent Civic Association",
  10446: "Cathedral Park Community Development Association",
  10414: "East Kensington Neighbors Association",
  10415: "Cedar Point Park Neighborhood Association",
  10416: "Washington Square West Civic Association",
  10417: "Temple Area Property Association (TAPA)",
  10418: "25th Republican Ward",
  10419: "12th Ward Republicans",
  10386: "Winchester Park Civic Association",
  10387: "Viola Street Residents Association",
  10388: "Overbrook Farms Club",
  10389: "Wynnefield Residents Association",
  10384: "Woodland Terrace HomeOwners Association",
  10385: "Belfield Area Neighbors Association (BANA)",
  10390: "East Falls Community Council",
  10391: "Hawthorne Empowerment Coalition",
  10392: "Pennsport Civic Association",
  10393: "South Philadelphia H.O.M.E.S., Inc",
  10394: "South Street Headhouse District",
  10395: "Stadium Community Council",
  10397: "Walton Park Civic Assn (WALPAC)",
  10398: "64th Republican Ward",
  10396: "35th Democratic Ward",
  10399: "Asociacion Puertorriquenos En Marcha (APM)",
  10400: "Tacony Civic Association",
  10401: "Mayfair Civic Association",
  10402: "Holmesburg Civic Association",
  10403: "Girard Estate Neighbors Association",
  10404: "SoLo/Germantown Civic Association",
  10405: "Greater Bustleton Civic League",
  10406: "East Passyunk Crossing Civic Association (EPX)",
  10512: "West Philadelphia Neighbors for Progressive Planning and Preservation",
  10513: "60th Street West Market Business Association",
  10514: "St. Elizabeth's RCO",
  10515: "Bridesburg Community Action Alliance",
  10516: "ONE Feltonville CCDC",
  10517: "Celestial Community Development Corporation",
  10518: "Concerned Neighbors for Change",
  10519: "Centennial Parkside Community Development Corporation",
  10447: "Parkside Area Community Association",
  10448: "Richard Allen New Generation",
  10449: "Central Manayunk Council",
  10450: "Dearnley Park Civic Association",
  10451: "Concerned Citizens Revitalization",
  10452: "43rd Democratic Ward",
  10453: "Hunting Park Connected",
  10454: "7th Ward Civic Association",
  10455: "Germantown SSD",
  10456: "Logan Civic Association",
  10457: "Greater Philadelphia Asian Social Service Center",
  10458: "52nd Democratic Ward",
  10459: "Yorktown Community Development Corporation",
  10461: "7th Ward Republicans",
  10462: "HMC Squared Community Association, INC",
  10460: "Hunting Park Neighborhood Advisory Committee",
  10463: "Logan Community Enterprise Center, Inc.",
  10464: "North Central Philadelphia Susquehanna Community Development Corporation",
  10466: "28th Republican Ward",
  10467: "36th Ward Democratic Executive Committee",
  10468: "57th Republican Ward of Philadelphia",
  10465: "Baltimore Avenue Business Association",
  10469: "Ward 37 GOP",
  10470: "Franklin Bridge North Neighbors Inc",
  10471: "Asian American Federation of the United States",
  10472: "Arbours at Eagle Pointe Community Association",
  10473: "Cobbs Creek Neighbors Association",
  10474: "33rd Ward Republicans",
  10475: "4th Ward Republicans",
  10476: "56th Ward Republicans",
  10477: "13th Republican Ward",
  10478: "Swampoodle Neighborhood Parcels Association",
  10479: "Lower Moyamensing Civic Association",
  10480: "Hestonville Civic Association",
  10482: "Port Richmond Industrial Development Enterprise (PRIDE)",
  10483: "Grays Ferry Civic Association",
  10484: "16th Republican Ward",
  10485: "14th Ward Democratic Executive Committee",
  10486: "West Belmont Civic Association",
  10481: "Cliveden Hills Association",
  10487: "Walnut Hill Community Association",
  10488: "35th Ward GOP Committee",
  10489: "Harrowgate Civic Association",
  10490: "East Falls Forward",
  10492: "48th Ward Republicans",
  10493: "43rd Ward Republicans",
  10494: "West Torresdale Civic Association",
  10495: "39th Ward Republicans",
  10491: "Somerset Neighbors for Better Living",
  10496: "14th Ward Republicans",
  10497: "19th Ward Republicans",
  10498: "41st Ward Republicans",
  10499: "42nd Ward Republicans",
  10500: "20th Ward Republicans",
  10501: "31st Ward Republican Committee",
  10503: "21st Ward Republican Committee",
  10504: "61st Ward Democratic Executive Committee",
  10505: "49th Ward",
  10506: "59th Democratic Ward",
  10502: "18th Ward Republican Committee",
  10507: "60th Ward Democratic Party",
  10508: "4th Ward RCO",
  10509: "Center City Organized for Responsible Development",
  10510: "West Philly Pride",
  10511: "Kingsessing Spirit",
  10371: "Drexel Area Property Association",
  10372: "Southwest Community Development Corporation",
  10373: "Parkwood Area Civic Association",
  10374: "27th Republican Ward",
  10375: "60th Republican Ward",
  10376: "Uptown Entertainment and Development Corporation",
  10377: "Mantua Civic Association",
  10378: "Blue Bell Hill Civic Association",
  10379: "13th Democratic Ward",
  10380: "52nd Republican Ward",
  10381: "Upper Holmesburg Civic Association",
  10382: "Greater Brewerytown CDC",
  10383: "Port Richmond On Patrol & Civic Association (PROPAC)",
  10319: "3rd Republican Ward",
  10320: "65th Republican Ward",
  10321: "32nd Democratic Ward",
  10322: "Eastwick Community Network",
  10323: "Wissahickon Interested Citizens Association",
  10324: "Chestnut Hill Historical Society",
  10325: "8th Ward Republican Committee",
  10326: "Oak Lane Community Action Association",
  10327: "Impact Community Development Corporation",
  10328: "Residents Organized for Advocacy and Direction",
  10329: "42nd Democratic Ward",
  10330: "Garden Court Community Association",
  10331: "South Kensington Community Partners",
  10332: "Rhawnhurst Civic Association",
  10333: "Frankford Neighborhood Advisory Committee",
  10334: "26th Republican Ward",
  10335: "Upper Roxborough Civic Association",
  10336: "Whitman Council Incorporated",
  10337: "55th Democratic Ward",
  10338: "Community Land Trust Corporation",
  10339: "Strawberry Mansion Neighborhood Action Center",
  10340: "West Passyunk Neighbors Association (WPNA)",
  10341: "Burholme Community Town Watch and Civic Association",
  10342: "New Kensington Community Development Corp",
  10343: "66th Republican Ward",
  10344: "Overbrook Park Civic Association",
  10345: "A Concerned Community Association (ACCA)",
  10346: "24th Republican Ward",
  10347: "ACHIEVEability",
  10348: "Strawberry Mansion Community Concern",
  10349: "Normandy Civic Association",
  10350: "30th Republican Ward",
  10351: "44th Ward Republican Committee",
  10352: "38th Republican Ward",
  10353: "46th Republican Ward",
  10354: "Friends of the Wissahickon",
  10355: "Oxford Circle Civic Association",
  10356: "Southwest Philadelphia District Services (SWPDS)",
  10357: "Lancaster Avenue 21st Century Business Association",
  10358: "40th Ward Republicans",
  10359: "Friends of Clark Park",
  10360: "People's Emergency Center Community Development Corporation",
  10361: "Chestnut Hill Community Association",
  10362: "Kingsessing Area Civic Association",
  10363: "Manayunk Neighborhood Council",
  10364: "Logan Square Neighborhood Association",
  10365: "Nicetown CDC",
  10366: "City Avenue Special Services District of Philadelphia and Lower Merion",
  10367: "Queen Village Neighbors Association",
  10368: "44th Democratic Ward",
  10369: "West Central Germantown Neighbors",
  10370: "Take Back Your Neighborhood",
  10300: "Washington Avenue Property Owners Association",
  10301: "MAP Holistic CDC",
  10302: "24th Democratic Ward",
  10303: "Northwood Civic Association",
  10304: "West Mount Airy Neighbors, Inc.",
  10307: "45th Democratic Ward-PAC 45",
  10308: "Penn Knox Neighborhood Association",
  10309: "Point Breeze Civic Association",
  10310: "6th Ward Republicans",
  10305: "Bridesburg Civic Association",
  10306: "South Street West Improvement District, Inc",
  10311: "Northeast Community Civic Alliance",
  10312: "38th Democratic Ward",
  10313: "37th Ward Executive Democratic Committee",
  10314: "50th Republican Ward",
  10315: "55th Republican Ward",
  10316: "36th Republican Ward",
  10317: "Wissinoming Civic Association",
  10318: "10th Republican Ward",
  10241: "Millbrook Civic Association",
  10242: "Nicetown-Tioga Improvement Team",
  10243: "10th Democratic Ward",
  10244: "54th Republican Ward",
  10245: "Progressive Communities CDC",
  10246: "Southwest Community Advisory Group",
  10247: "Spring Garden Civic Association",
  10248: "Philadelphia Chinatown Development Corporation",
  10249: "Village of Arts and Humanities",
  10250: "Wakefield 49ers Community Development and Improvement Association",
  10251: "South Philadelphia Communities Civic Association (SPCCA)",
  10252: "Upper Northwood Community Council",
  10253: "Grays Ferry Community Council",
  10254: "Francisville Neighborhood Development Corporation",
  10255: "23rd Republican Ward",
  10256: "Holme Circle Civic Association",
  10257: "Fox Chase Homeowners Association",
  10258: "Empowered Community Development Corporation",
  10259: "Society Hill Civic Association",
  10260: "Strawberry Mansion Community Development Corporation",
  10261: "Wynnefield Heights Civic Association",
  10262: "28th Democratic Ward",
  10263: "All In The Family Group Associates Incorporated",
  10264: "Norris Square Community Alliance",
  10265: "Northern Liberties Neighbors Association",
  10266: "Penn Area Neighborhood Association",
  10267: "Neighbors of Overbrook Association (NOAH)",
  10268: "Olde Richmond Civic Association",
  10269: "Friends of Ogden Park",
  10270: "53rd Democratic Ward",
  10271: "Brewerytown Sharswood Community Civic Association",
  10272: "Concerned Citizens of Point Breeze",
  10273: "East Mt. Airy Neighbors",
  10274: "South Street West Civic Association",
  10275: "51st Republican Ward",
  10276: "5th Ward Republican RCO",
  10277: "West Powelton Saunders Park RCO",
  10278: "1st Ward Republicans",
  10279: "Friends of Historic FDR Park",
  10280: "East Point Breeze Neighbors",
  10281: "Olde Kensington Neighborhood Association",
  10282: "53rd Republican Ward",
  10283: "Packer Park Civic Association",
  10284: "North of Washington Avenue Coalition",
  10285: "Community Action Group",
  10286: "Beech Community Services Incorporated",
  10287: "Girard Estate Area Residents (GEAR)",
  10288: "Germantown Community Connection",
  10289: "Lawncrest Community Association",
  10290: "Snyderville Community Development Corporation (SCDC)",
  10291: "Wissahickon Neighbors Civic Association (WNCA)",
  10292: "Point Breeze Community Development Corporation",
  10294: "Dickinson Square West Civic Association",
  10295: "Hispanic Association of Contractors and Enterprises Inc (HACE)",
  10296: "Newbold Civic Association",
  10297: "Bella Vista Neighbors Association",
  10298: "2nd Republican Ward",
  10293: "South Broad Street Neighborhood Association",
  10299: "Roxborough Development Corporation",
}

Mapboard.default({
  cyclomedia: {
    enabled: false
  },
  pictometry: {
    enabled: false
  },
  baseConfig: BASE_CONFIG_URL,
  // dataSources: {},
  // defaultAddress: searchInput,
  topics: [
    {
      key: 'litter',
      label: 'Litter',
      // icon: 'fa-trash-o',
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
                label: '<a class="external" target="_blank" href="//philadelphiastreets.com/sanitation/residential/collection-schedules/">Trash & Recycling Day</a>',
                value: function (state) {
                  var day = state.geocode.data.properties.rubbish_recycle_day;
                  var DAYS_FORMATTED = {
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
                label: '<a class="external" target="_blank" href="//philadelphiastreets.com/recycling/home-base-residential/">Recycling Diversion Rate</a>',
                value: function (state) {
                  var rate = state.geocode.data.properties.recycling_diversion_rate,
                      ratePercent = parseInt(rate * 100);
                      ratePercentStr = ratePercent + '%';

                  return ratePercentStr;
                },
              },
              {
                label: '<a class="external" target="_blank" href="//opendataphilly.org/dataset/sanitation-districts">Sanitation District</a>',
                value: function (state) {
                  return state.geocode.data.properties.sanitation_district;
                }
              },
              // {
              //   label: '<a href="">PMBC Representative</a>',
              //   value: 'NOT READY'
              // },
              {
                label: '<a class="external" target="_blank" href="//philadelphiastreets.com/sanitation/residential/sanitation-convenience-centers/">Sanitation Convenience Center</a>',
                value: function (state) {
                  return state.geocode.data.properties.sanitation_convenience_center;
                }
              },
              {
                label: '<a class="external" target="_blank" href="//philadelphiastreets.com/pmbc/">PMBC Block Captain</a>',
                value: function (state) {
                  return state.geocode.data.properties.clean_philly_block_captain;
                }
              },
              {
                label: '<a class="external" target="_blank" href="//phila.gov/ParksandRecreation/getinvolved/friendsgroups/Pages/default.aspx">PPR Friends Group</a>',
                value: function (state) {
                  return state.geocode.data.properties.ppr_friends;
                }
              },
              {
                label: '<a class="external" target="_blank" href="//phillywatersheds.org/what_were_doing/community_partnerships">Watershed Group</a>',
                value: function (state) {
                  return state.geocode.data.properties.major_phila_watershed;
                }
              },
              {
                label: '<a class="external" target="_blank" href="//phila.gov/commerce/neighborhoods/Pages/RevitalizingCorridors.aspx">Commercial Corridor Cleaning Program</a>',
                value: function (state) {
                  return state.geocode.data.properties.commercial_corridor;
                }
              },
              {
                label: '<a class="external" target="_blank" href="//phila.gov/dhcd/neighborhood-resources/neighborhood-advisory-committees/">Neighborhood Advisory Committee</a>',
                value: function (state) {
                  return state.geocode.data.properties.neighborhood_advisory_committee;
                }
              },
              // {
              //   label: 'Registered Community Organizations',
              //   value: function (state) {
              //     // TODO figure out how to source these properly
              //
              //     var rcoIdsJoined = state.geocode.data.properties.zoning_rco,
              //         rcoIds = rcoIdsJoined.split('|'),
              //         rcoNames = [];
              //
              //     // convert rco id to name
              //     for (var i = 0; i < rcoIds.length; i++) {
              //       var rcoId = parseInt(rcoIds[i]),
              //           rcoName = RCO_NAMES[rcoId];
              //       console.log('rco name', rcoName, rcoId);
              //       // rcoNames.push(rcoName);
              //       rcoNames.push(rcoId);
              //     }
              //
              //     var rcoNamesJoined = rcoNames.join(', ');
              //
              //     return rcoNamesJoined;
              //   }
              // }
            ],
          }
        },
      ],
      basemap: 'pwd',
      identifyFeature: 'address-marker',
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
    }
  }
});
