<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_
      @l-click="handleMapClick"
      @l-dragend="handleMapDragend"
      :zoomControlPosition="'bottomright'"
    >
      <!-- controls -->
      <SearchControl :position="'topleft'" />

      <!-- basemaps -->
      <EsriTiledMapLayer v-for="(basemap, key) in this.$config._map.basemaps"
                         v-if="activeBasemap === key"
                         :key="key"
                         :url="basemap.url"
      />
    </Map_>
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import SearchControl from './SearchControl';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';

  export default {
    components: {
      Map_,
      SearchControl,
      EsriTiledMapLayer
    },
    computed: {
      activeBasemap() {
        return this.activeTopicConfig.basemap;
      },
      activeTopicConfig() {
        const key = this.$store.state.topic;
        return this.$config.topics.filter((topic) => {
          return topic.key === key;
        })[0];
      }
    },
    methods: {
      handleMapClick(e) {
        // TODO query active parcel layer and search AIS
      }
    }
  };
</script>
