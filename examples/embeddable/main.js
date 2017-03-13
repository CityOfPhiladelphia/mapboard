Mapboard.default({
  topics: [
    {
      key: 'trash',
      label: 'Trash',
      components: [
        {
          type: 'simple-badge'
        }
      ]
    },
    {
      key: 'Recycling',
      label: 'Recycling',
      components: [
        {
          type: 'horizontal-table'
        }
      ]
    }
  ],
  map: {
    layers: [
      'parcels',

    ],
  },
});
