<template>
  <div class="leaflet-bar easy-button-container leaflet-control">
    <button @click="handleImageryToggleButtonClick">
      <span class="button-state state-unnamed-state unnamed-state-active">
        <img class="button-image" :src="toggleButtonImgSrc">
      </span>
    </button>
  </div>
</template>

<script>
  import Control from '../leaflet/Control';
  const {props, methods} = Control;

  export default {
    props: [
      'position'
    ],
    computed: {
      activeBasemap() {
        return this.$store.state.map.basemap;
      },
      basemapSelectValue() {
        return this.$store.state.map.basemapSelectValue;
      },
      toggleButtonImgSrc() {
        const basemap = this.activeBasemap;
        const basemapConfig = this.configForBasemap(basemap) || {};
        const basemapType = basemapConfig.type;
        let src;

        if (basemapType === 'imagery' || basemapType === 'historic') {
          src = "../../src/assets/basemap_small.png"
        }
        else {
          src = "../../src/assets/imagery_small.png"
        }

        return src;
      },
    },
    methods: Object.assign(methods, {
      configForBasemap(key) {
        return this.$config.map.basemaps[key] || {};
      },
      // return a list of imagery basemap years in descending order
      handleImageryToggleButtonClick(e) {
        const prevBasemap = this.activeBasemap;
        const prevBasemapConfig = this.configForBasemap(prevBasemap);
        const prevBasemapType = prevBasemapConfig.type;
        let nextBasemap;

        // feature map => imagery
        if (prevBasemapType === 'featuremap') {
          nextBasemap = this.basemapSelectValue;
        }
        // imagery => feature map
        else {
          const activeTopic = this.$store.state.activeTopic;
          const activeTopicConfig = this.$config.topics.filter(topic => topic.key === activeTopic)[0];
          nextBasemap = activeTopicConfig.basemap;
        }
        console.log('handleImageryToggleButtonClick', nextBasemap);
        this.$store.commit('setBasemap', nextBasemap);
      },
    })
  };
</script>

<style scoped>
  .button-image {
    vertical-align: top;
  }
</style>
