<template>
  <div id="mb-header"
       class="cell medium-24"
  >
  <!-- :class="rootClass"
  :style="mbRootStyle" -->

  <header class="site-header app group">
    <div class="row expanded">
      <div class="columns">
        <a href="//beta.phila.gov" class="logo">
          <img src="https://standards.phila.gov/img/logo/city-of-philadelphia-yellow-white.png" alt="City of Philadelphia">
        </a>
        <div class="app-divide"></div>
        <div class="page-title-container">
          <a href="#/">
            <h1 class="page-title"
                :style="mbHeaderStyle"
            >
              {{ this.headerText }}
              <!-- Real Estate Tax Balance Search -->
            </h1>
          </a>
        </div>
      </div>
    </div>
  </header>

  </div>
</template>

<script>

  export default {
    data() {
      const data = {
        // this will only affect the app size if the app is set to "plugin" mode
        mbHeaderStyle: {
          'font-size': '30px'
        }
      };
      return data;
    },
    created() {
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    computed: {
      headerText() {
        if (this.$config.header) {
          return this.$config.header.text;
        } else {
          return null;
        }
      },
    },
    methods: {
      handleWindowResize() {
        // this only actually affects the size if it is set to "plugin mode"
        if (window.innerWidth >= 750) {
          this.mbHeaderStyle['font-size'] = '30px'
        } else {
          this.mbHeaderStyle['font-size'] = '25px';
        }
      }
    }
  };

</script>

<style>

</style>
