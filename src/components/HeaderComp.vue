<template>
  <div
    id="mb-header"
    class="cell medium-24"
  >
    <div class="combo-header">
      <header class="site-header app group">
        <div class="row expanded">
          <div class="columns">
            <a
              href="//beta.phila.gov"
              class="logo"
            >
              <img
                :class="imgSize"
                :src="imgSrc"
                alt="City of Philadelphia"
              >
            </a>
            <div class="app-divide" />
            <div class="page-title-container">
              <a href="#/">
                <h1
                  class="page-title"
                  :style="mbHeaderStyle"
                >
                  {{ headerText }}
                </h1>
              </a>
            </div>

            <div
              v-if="shouldShowi18nBanner"
              class="show-for-small-only small-2 globe-container"
            >
              <popover-icon
                :slots="popoverIconSlots"
                :options="popoverIconOptions"
                @language-selected="testMethod"
              />

            </div>

          </div>
        </div>
      </header>

      <slot name="i18nBanner" />
      <slot name="alertBanner" />
    </div>
  </div>
</template>

<script>

// import i18nBanner from './i18nBanner.vue';

export default {
  components: {
    PopoverIcon: () => import(/* webpackChunkName: "mbmp_pvc_PopoverIcon" */'@phila/vue-comps/src/components/PopoverIcon.vue'),
    // i18nBanner,
  },
  data() {
    const data = {
      // this will only affect the app size if the app is set to "plugin" mode
      mbHeaderStyle: {
        'font-size': '30px',
        'line-height': '30px',
      },
      i18nListIsOpen: false,
      popoverIconSlots: {
        value: 'Select Language',
      },
      popoverIconOptions: {
        height: '100%',
        components: [
          {
            type: 'i18n-banner',
          },
        ],
      },
    };
    return data;
  },
  computed: {
    activeTopic() {
      return this.$store.state.activeTopic;
    },
    shouldShowi18nBanner() {
      let topics;
      if (this.$config.i18n && this.$config.i18n.topics) {
        topics = this.$config.i18n.topics;
      }
      // console.log('shouldShowi18nBanner, topics:', topics);
      let value = false;
      if (this.$config.i18n && this.$config.i18n.enabled && topics.includes(this.activeTopic)) {
        value = true;
      }
      return value;
    },
    headerText() {
      if (this.$config.header) {
        return this.$config.header.text;
      }
      return null;

    },
    imgSize() {
      if (this.$store.state.windowDimensions.width >= 750) {
        return 'normal-image';
      } else {
        return 'large-image';
      }
    },
    publicPath() {
      let publicPath = '';
      if (this.$config.publicPath) {
        publicPath = this.$config.publicPath;
      }
      return publicPath;
    },
    imgSrc() {
      let imageName, smallImageName;
      if (this.$config.headerImg) {
        imageName = this.$config.headerImg;
      } else {
        imageName = 'city-of-philadelphia-yellow-white.png';
      }
      if (this.$config.smallHeaderImg) {
        smallImageName = this.$config.smallHeaderImg;
      } else {
        smallImageName = 'city-of-philadelphia-bell.png';
      }
      if (this.$store.state.windowDimensions.width >= 750) {
        return window.location.origin + this.publicPath + '/images/' + imageName; //city-of-philadelphia-yellow-white.png';
      } else {
        return window.location.origin + this.publicPath + '/images/' + smallImageName;//city-of-philadelphia-bell.png';
      }
    },
  },
  created() {
    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize();
  },
  mounted() {
    console.log('HeaderComp mounted is running');
    this.$store.commit('setHeaderLoaded', true);
  },
  methods: {
    testMethod() {
      console.log('HeaderComp testMethod is running');
    },
    handleWindowResize() {
      // this only actually affects the size if it is set to "plugin mode"
      if (window.innerWidth >= 750) {
        this.mbHeaderStyle = {
          'font-size': '30px',
          'line-height': '30px',
        };
      } else {
        this.mbHeaderStyle = {
          'font-size': '22px',
          'line-height': '22px',
        };
      }
    },
  },
};

</script>

<style>

  .page-title {
    padding-top: 6px;
    /* padding-bottom: 0px !important;
    padding-right: 8px !important;
    padding-left: 8px !important; */
  }

  /* .logo {
    display: inline-block;
    height: 10px;
    width: 10px;
  } */

  .large-image {
    height: 42px;
    width: 42px;
  }

  .globe-container {
    float: right;
    margin-top: 8px;
  }

</style>
