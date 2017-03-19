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
    center: [39.952388, -75.163596],
    zoom: 17,
    // these should go into app config
    basemapButtonImages: {
      basemap: "../../src/assets/basemap_small.png",
      imagery: "../../src/assets/imagery_small.png"
    },
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
    imagery: {
      imagery2016: {
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2016_3in/MapServer',
      },
    },
    tiledLayers: {
      cityBasemapLabels: {
        // type: 'labels',
        url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer'
      }
    }
  }
});
