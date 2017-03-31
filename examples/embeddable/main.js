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
      key: 'litter',
      label: 'Litter Index',
      components: [
        // {
        //   type: 'horizontal'
        // }
      ],
      basemap: 'pwd',
      dynamicMapLayers: [
        'stormwater'
      ],
      parcels: 'pwd'
    }
    }
  ],
  map: {
    center: [39.951618, -75.1650911],
    zoom: 13
  }
});
