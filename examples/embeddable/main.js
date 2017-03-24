Mapboard.default({
  dataSources: {
    opa: {
      url: '//data.phila.gov/resource/w7rb-qrn8.json',
      params: {
        parcel_number: (aisFeature) => aisFeature.properties.opa_account_num
      }
    },
    liPermits: {},
    liInspections: {},
  },
  topics: [
    {
      key: 'dor',
      label: 'DOR',
      components: [
        {
          type: 'simple-badge'
        }
      ],
      basemap: 'dor'
    },
    {
      key: 'pwd',
      label: 'PWD',
      components: [
        {
          type: 'horizontal-table'
        }
      ],
      basemap: 'pwd',
      dynamicMapLayers: [
        'stormwater'
      ]
    }
  ],
  map: {
    center: [39.951618, -75.1650911],
    zoom: 13
  }
});
