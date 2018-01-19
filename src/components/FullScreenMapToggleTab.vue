<template>
  <div class="toggle-tab"
       @click="handleFullScreenMapToggleButtonClick"
       v-if="!this.isMobileOrTablet"
  >
    <span class="align-span">
      <i :class='this.currentIcon'></i>
    </span>
  </div>
</template>

<script>
  import Control from '../leaflet/Control.vue';

  const {props, methods} = Control;

  export default {
    props: [
      'position'
    ],
    computed: {
      fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      isMobileOrTablet() {
        return this.$store.state.isMobileOrTablet;
      },
      currentIcon() {
        if (this.fullScreenMapEnabled) {
          return 'fa fa-caret-right fa-2x'
        } else {
          return 'fa fa-caret-left fa-2x'
        }
      }
    },
    methods: Object.assign(methods, {
      handleFullScreenMapToggleButtonClick(e) {
        const prevFullScreenMapEnabled = this.$store.state.fullScreenMapEnabled;
        const nextFullScreenMapEnabled = !prevFullScreenMapEnabled;
        this.$store.commit('setFullScreenMapEnabled', nextFullScreenMapEnabled);
      },
    })
  };
</script>

<style scoped>

  .toggle-tab {
    border-left-style: solid;
    border-width: 1.3px;
    border-color: #CAC9C9;
    height: 48px;
    line-height: 58px;
    width:24px;
    background-color: white;
    display: inline-block;
    box-shadow: 2px 2px 7px grey;
  }

  .align-span {
    margin-left: 6px;
  }

</style>
