<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_>
      <!-- basemaps -->
      <EsriTiledMapLayer v-for="(basemap, key) in this.$config.map.basemaps"
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
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';

  export default {
    components: {
      Map_,
      EsriTiledMapLayer
    },
    computed: {
      activeBasemap() {
        return this.activeTopicConfig.basemap;
      },
      activeTopicConfig() {
        const key = this.$store.state.topic;
        console.log(key)
        return this.$config.topics.filter((topic) => {
          console.log('compare', topic.key, key)
          return topic.key === key;
        })[0];
      }
    }
  };
</script>
