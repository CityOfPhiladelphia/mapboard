Mapboard.default({
  dataSources: {
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
    zoom: 13
  }
});
