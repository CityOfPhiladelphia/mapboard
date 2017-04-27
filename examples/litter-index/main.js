Mapboard.default({
  rootStyle: {
    height: '600px'
  },
  cyclomedia: {
    enabled: false
  },
  pictometry: {
    enabled: false
  },
  baseConfig: '//gist.githubusercontent.com/rbrtmrtn/09b4f35396f97499c3097e2fecaed8e7/raw/b0c28174d21700b2594223dfa9fa2c504c47c78d/config.js',
  // dataSources: {},
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
      ],
      parcels: 'pwd'
    }
  ]
});
