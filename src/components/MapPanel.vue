<template>
  <div class="large-12 columns mb-panel mb-panel-map">
    <Map_>
      <!-- basemaps -->
      <EsriTiledMapLayer v-for="(basemap, key) in this.$config.map.basemaps"
                         v-if="baseOrImage === key"
                         :key="key"
                         :url="basemap.url"
      />
      <!-- imagery -->
      <EsriTiledMapLayer v-for="(imagery, key) in this.$config.map.imagery"
                         v-if="baseOrImage === key"
                         :key="key"
                         :url="imagery.url"
      />
      <!--<EasyButton @click="console.log('clicked')"/>-->
      <!--<ScaleControl />-->
      <BasemapToggleButton />
    </Map_>
  </div>
</template>

<script>
  // vue doesn't like it when you import this as Map (reserved-ish word)
  import Map_ from '../leaflet/Map';
  import EsriTiledMapLayer from '../esri-leaflet/TiledMapLayer';
  import EasyButton from '../leaflet/EasyButton';
  import BasemapToggleButton from '../leaflet/BasemapToggleButton';
  import ScaleControl from '../leaflet/ScaleControl';



  export default {
    components: {
      Map_,
      EsriTiledMapLayer,
      EasyButton,
      BasemapToggleButton,
      ScaleControl
    },
    computed: {
      baseOrImage() {
        const toggle = this.$store.state.base;
        if (toggle === 'basemap'){
          return this.activeTopicConfig.basemap;
        } else {
          return this.$store.state.imagery;
        }
      },
      activeImagery() {
        return this.$store.state.imagery;
      },
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
    /*methods: {
      setBase() {
        console.log('clicked');
        //const topic = this.$props.topic.key;
        console.log(this.$store.state.base);
        if (this.$store.state.base === 'basemap') {
          this.$store.commit('setBase', 'imagery');
        } else {
          this.$store.commit('setBase', 'basemap');
        }
      },
    }*/
  };
</script>
