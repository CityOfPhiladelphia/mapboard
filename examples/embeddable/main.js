Mapboard.default({
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
      basemap: 'pwd'
    }
  ],
  map: {
    center: [39.951618, -75.1650911],
    zoom: 13,
    // these should go into app config
    basemaps: {
      pwd: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
        // tiledLayers: [
        //   'cityBasemapLabels'
        // ],
      },
      dor: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/DORBasemap/MapServer',
        // tiledLayers: [
        //
        // ]
      }
    },
    tiledLayers: {
      cityBasemapLabels: {
        // type: 'labels',
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer'
      }
    }
  }
});
