<template>
  <div id='basemap-toggle' class='leaflet-bar leaflet-control leaflet-control-load basemap-toggle-button'>
    <a href="#" @click="setBase">
      <img class='buttom-image' :src="baseImg">
    </a>
  </div>
</template>

<script>
  import L from 'leaflet';
  // TODO look into a cleaner way of importing from esri-leaflet
  L.Control.BasemapToggleButton = L.Control.extend({
    onAdd: function() {
      this._div = L.DomUtil.get('basemap-toggle');
    	return this._div;
    }
  });
  const BasemapToggleButton = L.Control.BasemapToggleButton;

  export default {
    props: ['baseImg'],
    mounted() {
      const leafletElement = this.$leafletElement = this.createLeafletElement();
      const map = this.$store.state.map;
      // REVIEW kind of hacky/not reactive?
      if (map) {
        leafletElement.addTo(map);
      }
    },
    computed: {
      baseImg() {
        if (this.$store.state.base === 'basemap') {
          return "../../src/assets/imagery_small.png"
        }
        if (this.$store.state.base === 'imagery') {
          return "../../src/assets/basemap_small.png"
        }
      },
    },
    methods: {
      createLeafletElement() {
        return new BasemapToggleButton({
          position: 'topright'
        })
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        this.$leafletElement.addTo(map);
      },
      setBase() {
        var answer;
        if (this.$store.state.base === 'basemap') {
          answer = 'imagery';
        }
        if (this.$store.state.base === 'imagery') {
          answer = 'basemap'
        }
        this.$store.commit('setBase', answer);
      }
    }
  };

</script>

<style scoped>
  .basemap-toggle-button {
      width: 30px;
      height: 30px;
      background: white;
      background: rgba(255,255,255,1);
      box-shadow: 0 0 15px rgba(0,0,0,0.2);
      display: inline-block;
      float: none;
  }

  .buttom-image {
    vertical-align: top;
  }
</style>
