<template>
  <div v-show="this.$store.state.imageryOn === true" />
</template>

<script>
  import L from 'leaflet';
  const EasyButton = L.easyButton;
  const EasyBar = L.easyBar;
  const store = this.$store;

  export default {
    mounted() {
      this.$buttonArray = []
      const map = this.$store.state.map;
      const maps = this.$config.map.basemaps
      const imageryBasemaps = Object.values(maps).filter((map) => {
          return map.type === 'imagery';
      })
      for (let imageryBasemap of imageryBasemaps) {
        const leafletElement = this.$leafletElement = this.createLeafletElement(imageryBasemap);
        this.$buttonArray.push(leafletElement);
      };
      const leafletBar = this.$leafletBar = this.createLeafletBar();
      if (map) {
        //if (this.$store.state.imageryOn === true) {
          leafletBar.addTo(map);
        //}
      }
    },
    // render(h) {
    //   return;
    // },
    methods: {
      createLeafletElement(imageryBasemap) {
        var thisVue = this
        return new EasyButton({
          id: imageryBasemap.label+'ToggleButton',
          states:[{
            stateName: 'dateNotSelected',
            icon: '<strong class="aDate">'+imageryBasemap.label+'</strong>',
            title: 'Show '+imageryBasemap.label+' Imagery',
            onClick: function(control){
              thisVue.$store.commit('toggleImageryYear', 'imagery'+imageryBasemap.label);
              control.state('dateSelected');
            }
          }, {
            stateName: 'dateSelected',
            icon: '<strong>'+imageryBasemap.label+'</strong>',
            title: 'Show '+imageryBasemap.label+' Imagery',
          }]
        })
      },
      createLeafletBar() {
        return new EasyBar(this.$buttonArray, {
          position: 'topalmostright'
        })
      },
      parentMounted(parent) {
        const map = parent.$leafletElement;
        // if (this.$store.state.imageryOn === true) {
        //   this.$leafletBar.addTo(map);
        // }
        this.$leafletBar.addTo(map);
      }
    }
  }

</script>

<style>

.leaflet-bar button,
.leaflet-bar button:hover {
  background-color: #fff;
  border: none;
  border-bottom: 1px solid #ccc;
  width: 26px;
  height: 26px;
  line-height: 26px;
  display: block;
  text-align: center;
  text-decoration: none;
  color: black;
}

.leaflet-bar button {
  background-position: 50% 50%;
  background-repeat: no-repeat;
  overflow: hidden;
  display: block;
}

.leaflet-bar button:hover {
  background-color: #f4f4f4;
}

.leaflet-bar button:first-of-type {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.leaflet-bar button:last-of-type {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-bottom: none;
}

.leaflet-bar.disabled,
.leaflet-bar button.disabled {
  cursor: default;
  pointer-events: none;
  opacity: .4;
}

.easy-button-button .button-state{
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.leaflet-touch .leaflet-bar button {
  width: 30px;
  height: 30px;
  line-height: 30px;
}





.easy-button-button.dateNotSelected-active {
  height: 30px;
  width: 35px;
  background-color: #cfcfcf
}

.easy-button-button.dateSelected-active {
  height: 30px;
  width: 35px;
  background-color: #ffffff
}

.leaflet-bar button:hover {
  height: 30px;
  width: 35px;
}

.leaflet-touch .leaflet-bar button {
  width: 35px;
  height: 30px;
  line-height: 30px;
}
</style>
