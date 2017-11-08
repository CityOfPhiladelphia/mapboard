<template>
  <div class="cell medium-12 small-order-2 medium-order-1">
      <!-- before search -->
      <greeting v-show="shouldShowGreeting" />

      <!-- after search -->
      <div v-if="!shouldShowGreeting" class="cell">
        <!-- address header -->
        <div class="address-header">
          <h1 class="address-header-line-1">
            <i class="fa fa-map-marker"></i>
            {{ address }}
          </h1>
          <div class="address-header-line-2">PHILADELPHIA, PA {{ zipCode }}</div>
        </div>

        <!-- topics container -->
        <div class="topics-container cell medium-cell-block-y"
        >
          <topic v-for="topic in this.$config.topics"
                 :topicKey="topic.key"
                 :key="topic.key"
          />
        </div>
      </div>
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
    // data() {
    //   const data = {
    //     styleObject: {
    //       'position': 'relative',
    //       'top': '100px',
    //       'overflow-y': 'auto',
    //       'height': '100px'
    //     }
    //   };
    //   return data;
    // },
    // mounted() {
    //   window.addEventListener('resize', this.handleWindowResize);
    //   this.handleWindowResize();
    // },
    // beforeDestroy() {
    //   window.removeEventListener('resize', this.handleWindowResize);
    // },
    computed: {
      geocode() {
        return this.$store.state.geocode.data;
      },
      dorParcels() {
        return this.$store.state.parcels.dor.data.length > 0;
      },
      shouldShowGreeting() {
        return !(this.geocode || this.dorParcels);
      },
      // this returns the address shown in the address header
      address() {
        const geocode = this.geocode;
        const dorParcels = this.$store.state.parcels.dor.data;
        const activeDorAddress = this.$store.state.parcels.dor.activeAddress;
        let address;

        if (geocode) {
          // TODO make this not ais-specific
          // REVIEW what's the difference between these two?
          const addressA = geocode.properties.street_address;
          const addressB = geocode.street_address;

          address = addressA || addressB;

        // a DOR address might be found even if there is no geocode
        } else if (activeDorAddress) {
          address = activeDorAddress;
        }

        return address;
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
      // handleWindowResize() {
      //   // console.log('handleWindowResize is running');
      //   const rootElement = document.getElementById('mb-root');
      //   const rootStyle = window.getComputedStyle(rootElement);
      //   const rootHeight = rootStyle.getPropertyValue('height');
      //   const rootHeightNum = parseInt(rootHeight.replace('px', ''));
      //   const topicsHeight = rootHeightNum - 100;
      //   this.styleObject.height = topicsHeight.toString() + 'px';
      // }
    }
  };
</script>

<style scoped>
  .address-header {
    background: #daedfe;
    color: #0f4d90;
    padding: 20px;

    /*this keeps the box shadow over the scrollable part of the panel*/
    position: relative;
    z-index: 1;

    -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  }

  .address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
  }

  .topics-container {
    padding: 20px;
  }

  @media screen and (min-width: 40em) {
    .topics-container {
      height: calc(100vh - 210px);
    }
  }
</style>
