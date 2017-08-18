<template>
  <div v-show="this.activeBasemapType !== 'featuremap'">
    <select id="year-select" @change="handleImageryYearChange">
      <optgroup label="Imagery">
        <option v-for="imageryYear in imageryYears">
          {{imageryYear}}
        </option>
      </optgroup>
      <optgroup label="Historic">
        <option v-for="historicYear in historicYears">
          {{historicYear}}
        </option>
      </optgroup>
    </select>
  </div>
</template>

<script>
  import Control from '../leaflet/Control';
  const {props, methods} = Control;

  export default {
    props: [
      'position',
      'imageryYears',
      'historicYears'
    ],
    computed: {
      activeBasemap() {
        return this.$store.state.map.basemap;
      },
      activeBasemapType() {
        const config = this.$config.map.basemaps[this.activeBasemap];
        return config.type;
      }
    },
    methods: Object.assign(methods, {
      handleImageryYearChange() {
        const e = document.getElementById('year-select');
        const group = e.options[e.selectedIndex].parentElement.label
        const year = e.options[e.selectedIndex].value;
        const nextBasemap = group.toLowerCase() + year;
        this.$store.commit('setBasemapSelectValue', nextBasemap);
        this.$store.commit('setBasemap', nextBasemap);
      },
    })
  };
</script>

<style scoped>

</style>
