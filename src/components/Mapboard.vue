<template>
  <div
    id="mb-root"
    :class="rootClass"
    :style="mbRootStyle"
  >
    <component
      :is="headerCompLoader"
      v-if="shouldShowHeader"
    >
      <component
        :is="this.$config.alerts.header"
        v-if="this.$config.alerts && this.$config.alerts.header != null"
      />
    </component>

    <component
      :is="healthCheck.type"
      v-for="(healthCheck, index) in this.$config.healthChecks"
      v-if="healthCheck.type === maintenanceResponse"
      :key="index"
    />
    <component
      :is="topicPanelLoader"
      v-if="!maintenanceResponse"
      :class="shouldShowTopicPanel"
    />
    <component
      :is="mapPanelLoader"
      v-if="!maintenanceResponse"
      :class="shouldShowMapPanel"
    >
      <cyclomedia-widget
        v-if="shouldLoadCyclomediaWidget"
        v-show="cyclomediaActive"
        slot="cycloWidget"
        screen-percent="2"
        :orientation="this.$config.cyclomedia.orientation"
      />
      <pictometry-widget
        v-if="shouldLoadPictometryWidget"
        v-show="pictometryActive"
        slot="pictWidget"
        :orientation="this.$config.pictometry.orientation"
      >
        <pictometry-png-marker
          v-if="pictometryShowAddressMarker"
          :latlng="[geocodeData.geometry.coordinates[1], geocodeData.geometry.coordinates[0]]"
          :icon="'images/markers.png'"
          :height="60"
          :width="40"
          :offset-x="0"
          :offset-y="0"
        />
        <pictometry-layer v-if="pictometryActive" />
        <pictometry-png-marker
          v-if="cyclomediaActive && pictometryActive"
          :latlng="cycloLatlng"
          :icon="'images/camera2.png'"
          :height="20"
          :width="30"
          :offset-x="-2"
          :offset-y="-2"
        />
        <pictometry-view-cone
          v-if="cyclomediaActive && pictometryActive"
          :latlng="cycloLatlng"
          :rotation-angle="cycloRotationAngle"
          :h-fov="cycloHFov"
        />
      </pictometry-widget>
    </component>

    <!-- <component
      :is="footerCompLoader"
    /> -->
    <!-- v-if="shouldShowHeader" -->

    <popover
      v-if="popoverOpen"
      :options="popoverOptions"
      :slots="{'text': popoverText}"
    />
    <!-- v-if="popoverOpen && popoverText.length > 0" -->
    <!-- </div> -->
  </div>
</template>

<script>
// console.log('test Mapboard.vue, this:', this, 'this.$config:', this.$config);

import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  components: {
    CyclomediaWidget: () => import(/* webpackChunkName: "mbmb_pvm_CyclomediaWidget" */'@phila/vue-mapping/src/cyclomedia/Widget.vue'),
    PictometryWidget: () => import(/* webpackChunkName: "mbmb_pvm_PictometryWidget" */'@phila/vue-mapping/src/pictometry/Widget.vue'),
    PictometryLayer: () => import(/* webpackChunkName: "mbmb_pvm_PictometryLayer" */'@phila/vue-mapping/src/pictometry/Layer.vue'),
    PictometryPngMarker: () => import(/* webpackChunkName: "mbmb_pvm_PictometryPngMarker" */'@phila/vue-mapping/src/pictometry/PngMarker.vue'),
    PictometryViewCone: () => import(/* webpackChunkName: "mbmb_pvm_PictometryViewCone" */'@phila/vue-mapping/src/pictometry/ViewCone.vue'),
    Popover: () => import(/* webpackChunkName: "mbmb_pvc_Popover" */'@phila/vue-comps/src/components/Popover.vue'),
  },
  data() {
    const data = {
      // this will only affect the app size if the app is set to "plugin" mode
      mbRootStyle: {
        'height': '100px',
      },
    };
    return data;
  },
  computed: {
    mapType() {
      return this.$store.state.map.type;
    },
    maintenanceResponse() {
      return this.$store.state.maintenanceResponse || null;
    },
    mapPanelLoader() {
      // console.log('computed mapPanelLoader is running');
      if (this.fullScreenTopicsOnly) {
        // console.log('if this.fullScreenTopicsOnly is true, returning');
        return;
      }
      // console.log('else is true, importing mapPanel.vue');
      return () => import(/* webpackChunkName: "mbmb_MapPanelLoader" */'./MapPanel.vue');//.then(console.log('after MapPanel import'))

    },
    topicPanelLoader() {
      if (this.fullScreenMapOnly) {
        // console.log('if this.fullScreenMapOnly is true, returning');
        return;
      }
      // console.log('else is true, importing topicPanel.vue');
      return () => import(/* webpackChunkName: "mbmb_TopicPanelLoader" */'./TopicPanel.vue');//.then(console.log('after TopicPanel import'))

    },
    headerCompLoader() {
      if (!this.shouldShowHeader) {
        // console.log('if this.fullScreenMapOnly is true, returning');
        return;
      }
      // console.log('else is true, importing topicPanel.vue');
      return () => import(/* webpackChunkName: "mbmb_headerCompLoader" */'./HeaderComp.vue');//.then(console.log('after HeaderComp import'))

    },
    shouldShowHeader() {
      if (this.$config.header) {
        return this.$config.header.enabled;
      }
      return false;

    },

    footerCompLoader() {
      return () => import(/* webpackChunkName: "mbmb_footerCompLoader" */'./PhilaFooter.vue');//.then(console.log('after PhilaFooter import'))
    },

    rootClass() {
      if (this.$config.plugin) {
        if (this.$config.plugin.enabled) {
          return 'grid-x';
        }
        return 'cell medium-auto grid-x';

      }
      if (this.maintenanceResponse !== null && this.maintenanceResponse !== '') {
        return 'cell medium-auto';
      } else {
        return 'cell medium-auto grid-x';
      }
    },
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
    },
    shouldLoadCyclomediaWidget() {
      return this.$config.cyclomedia.enabled;// && !this.isMobileOrTablet;
    },
    shouldLoadPictometryWidget() {
      return this.$config.pictometry.enabled;// && !this.isMobileOrTablet;
    },
    fullScreenMapOnly() {
      return this.$store.state.fullScreen.mapOnly;
    },
    fullScreenMapEnabled() {
      return this.$store.state.fullScreenMapEnabled;
    },
    fullScreenTopicsOnly() {
      // return true;
      return this.$store.state.fullScreen.topicsOnly;
    },
    fullScreenTopicsEnabled() {
      return this.$store.state.fullScreenTopicsEnabled;
    },
    shouldShowTopicPanel() {
      let value;
      if (!this.fullScreenMapEnabled && !this.fullScreenMapOnly) {
        value = 'topic-panel-true';
      } else {
        value = 'topic-panel-false';
      }
      return value;
    },
    shouldShowMapPanel() {
      let value;
      if (!this.fullScreenTopicsEnabled && !this.fullScreenTopicsOnly) {
        value = 'map-panel-true';
      } else {
        value = 'map-panel-false';
      }
      return value;
    },
    cyclomediaActive() {
      return this.$store.state.cyclomedia.active;
    },
    cycloLatlng() {
      if (this.$store.state.cyclomedia.orientation.xyz !== null) {
        const xyz = this.$store.state.cyclomedia.orientation.xyz;
        return [ xyz[1], xyz[0] ];
      }
      const center = this.$config.map.center;
      return center;

    },
    cycloRotationAngle() {
      return this.$store.state.cyclomedia.orientation.yaw * (180/3.14159265359);
    },
    cycloHFov() {
      return this.$store.state.cyclomedia.orientation.hFov;
    },
    pictometryActive() {
      return this.$store.state.pictometry.active;
    },
    pictometryZoom() {
      return this.$store.state.pictometry.zoom;
    },
    pictometryShowAddressMarker() {
      if (!this.pictometryActive || !this.geocodeData) {
        return false;
      } else if (this.pictometryZoom < 20 && this.cyclomediaActive) {
        return false;
      }
      return true;

    },
    geocodeData() {
      return this.$store.state.geocode.data;
    },
    popoverOpen() {
      return this.$store.state.popover.open;
    },
    popoverText() {
      return this.$store.state.popover.text;
    },
    popoverOptions() {
      return this.$store.state.popover.options;
    },
  },
  created() {
    // if (this.$config.plugin) {
    //   if (this.$config.plugin.enabled) {
    //     this.mbRootStyle.height = this.$config.plugin.height.toString() + 'px';
    //   }
    // }
    // console.log('mapboard created, this.$config:', this.$config);
    // console.log('mapboard created, this.$store:', this.$store);
    if (this.$config.panels) {
      if (!this.$config.panels.includes('map')) {
        this.$store.commit('setTopicsOnly', true);
      } else if (!this.$config.panels.includes('topics')) {
        this.$store.commit('setMapOnly', true);
      }
    }

    if (this.$config.map) {
      // if (this.$config.map.shouldInitialize === false) {
      //   this.$store.commit('setShouldInitializeMap', false);
      // }
      if (this.$config.map.type) {
        this.$store.commit('setMapType', this.$config.map.type);
      }
    }

    window.addEventListener('click', this.closeAddressCandidateList);
    window.addEventListener('resize', this.handleWindowResize);
  },
  mounted() {
    this.handleWindowResize();
    this.$controller.appDidLoad();
    if (this.$config.initialPopover && window.location.hash == '') {
      this.$store.commit('setPopoverOpen', true);
      this.$store.commit('setPopoverOptions', this.$config.initialPopover.options);
      if (this.$config.initialPopover.slots) {
        this.$store.commit('setPopoverText', this.$config.initialPopover.slots.text);
      }
    }
  },
  methods: {
    closeAddressCandidateList() {
      this.$store.commit('setShouldShowAddressCandidateList', false);
    },
    handleWindowResize() {
      // console.log('Mapboard.vue handleWindowResize is running');
      // this only actually affects the size if it is set to "plugin mode"
      if (this.$config.plugin) {
        if (this.$config.plugin.enabled) {
          this.mbRootStyle.height = this.$config.plugin.height.toString() + 'px';
          // return;
        }
      }

      if (window.innerWidth >= 750) {
        // this.mbRootStyle.height = '600px'
      } else {
        this.mbRootStyle.height = 'auto';
      }

      const rootElement = document.getElementById('mb-root');
      const rootStyle = window.getComputedStyle(rootElement);
      const rootWidth = rootStyle.getPropertyValue('width');
      const rootHeight = rootStyle.getPropertyValue('height');
      const rootWidthNum = parseInt(rootWidth.replace('px', ''));
      const rootHeightNum = parseInt(rootHeight.replace('px', ''));

      const dim = {
        width: rootWidthNum,
        height: rootHeightNum,
      };
      this.$store.commit('setWindowDimensions', dim);
    },
  },
};
</script>

<style>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .mb-panel-topics-with-widget {
    height: 50%;
  }

  /* standards applies padding to buttons, which causes some weirdness with
  buttons on the map panel. override here. */
  button {
    padding: inherit;
  }

  .topic-panel-false {
    /* display: none; */
  }

  @media screen and (min-width: 46.875em) {
    .topic-panel-false {
      display: none;
    }

    .map-panel-false {
      display: none;
    }
  }

</style>
