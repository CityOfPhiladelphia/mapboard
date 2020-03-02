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
          </div>
        </div>
      </header>

      <slot />

    </div>

  </div>
</template>

<script>

export default {
  data() {
    const data = {
      // this will only affect the app size if the app is set to "plugin" mode
      mbHeaderStyle: {
        'font-size': '30px',
        'line-height': '30px',
      },
    };
    return data;
  },
  computed: {
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
    imgSrc() {
      if (this.$store.state.windowDimensions.width >= 750) {
        return 'images/city-of-philadelphia-yellow-white.png';
      } else {
        return 'images/city-of-philadelphia-bell.png';
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

  /* .page-title-container {
    display: inline-block;
  } */

  /* .combo-header {
    display: block;
  } */

</style>
