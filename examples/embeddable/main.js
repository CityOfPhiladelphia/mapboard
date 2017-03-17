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
      key: 'voting',
      label: 'Voting',
      components: [
        {
          type: 'horizontal-table'
        }
      ]
    }
  ],
  map: {
    center: [39.951618, -75.1650911],
    zoom: 13,
    basemap: {
      url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer'
    }
  }
});
