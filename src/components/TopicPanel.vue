<template>
  <div class="large-12 columns mb-panel mb-panel-topics" id="topic-panel">
    <div class="row">
    <!-- <div class="row" :class="{ 'row-with-widget': this.$store.state.pictometry.active }"> -->
      <!-- before search -->
      <!-- <greeting v-show="!geocode" /> -->
      <greeting v-show="shouldShowGreeting" />

      <!-- after search -->
      <div v-if="!shouldShowGreeting" class="address-found-div">
        <div class="address-spacer" v-if="address">
          <div class="address-header">
            <h1 class="address-header-line-1">{{ address }}</h1>
            <div class="address-header-line-2 small-text">PHILADELPHIA, PA {{ zipCode }}</div>
          </div>
        </div>
        <!-- <div class="spacer-div"></div> -->
        <div class="topics-container"
             id="topics-container"
             :style="styleObject"
        >
          <topic v-for="topic in this.$config.topics"
                 :topicKey="topic.key"
                 :key="topic.key"
          />
        </div>
      </div>
    </div>
    <!-- <slot name="pictWidget" /> -->
  </div>
</template>

<script>
  import Greeting from './Greeting.vue';
  import Topic from './Topic.vue';

  export default {
    components: {
      Greeting,
      Topic
    },
    data() {
      const data = {
        styleObject: {
          'position': 'relative',
          'top': '100px',
          'overflow-y': 'auto',
          'height': '100px'
        }
      };
      return data;
    },
    mounted() {
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.handleWindowResize);
    },
    computed: {
      geocode() {
        return this.$store.state.geocode.data;
      },
      dorParcels() {
        return this.$store.state.dorParcels.data.length > 0;
      },
      shouldShowGreeting() {
        if (!this.geocode && !this.dorParcels) {
          return true;
        } else {
          return false;
        }
      },
      address() {
        const geocode = this.geocode;
        const dorParcels = this.$store.state.dorParcels.data
        const activeDorParcel = this.$store.state.activeDorParcel;
        // a DOR address might be found even if there is no geocode
        // if (!geocode) return null;
        // return geocode.properties.street_address;

        if (geocode) {
           return geocode.properties.street_address;
        } else {
          if (activeDorParcel) {
            for (let dorParcel of dorParcels) {
              if (dorParcel.properties.OBJECTID === activeDorParcel) {
                const address = concatDorAddress(dorParcel);
                this.$store.commit('setActiveDorAddress', address);
                this.$store.commit('setActiveDorMapreg', dorParcel.properties.MAPREG)
                return address;
              }
            }
          }
        }
      },
      zipCode() {
        const geocode = this.geocode;
        if (!geocode) return null;
        const zipCode = geocode.properties.zip_code;
        const zip4 = geocode.properties.zip_4;
        const parts = [zipCode];
        if (zip4) parts.push(zip4);
        return parts.join('-');
      },
    },
    methods: {
      shouldShowTopic(topic) {
        const requiredSources = topic.dataSources || [];

        // if there aren't any required topics, show it
        if (requiredSources.length === 0) {
          return true;
        }

        const sources = this.$store.state.sources;
        return requiredSources.every(key => sources[key].data)
      },
      handleWindowResize() {
        // console.log('handleWindowResize is running');
        const rootElement = document.getElementById('mb-root');
        const rootStyle = window.getComputedStyle(rootElement);
        const rootHeight = rootStyle.getPropertyValue('height');
        const rootHeightNum = parseInt(rootHeight.replace('px', ''));
        const topicsHeight = rootHeightNum - 100;
        this.styleObject.height = topicsHeight.toString() + 'px';
      }
    }
  };
</script>

<style>
  /*.row {
    height: 100%;
  }

  .address-found-div {
    height: 100%;
  }*/

  .mb-panel-topics {
    background: #fff;
    padding-left: 20px !important;
    padding-right: 20px !important;
    /*overflow-y: auto;*/
  }

  .address-spacer {
    position: absolute;
    left: -5px;
    height: 100px;
    width: 49%;
    background-color: white;
  }

  .address-header {
    position: absolute;
    color: #666;
    border-left: 5px solid #58c04d;
    margin-left: 15px;
    padding-left: 15px;
    margin-bottom: 25px;
    margin-top: 20px;
  }

  .address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
  }

  /*.spacer-div {
    height: 100px;
  }*/

  /*.topics-container {
    position: relative;
    top: 100px;
    overflow-y: auto;
  }*/
</style>
