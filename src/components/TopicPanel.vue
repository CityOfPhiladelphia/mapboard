<template>
  <div id="topic-panel-container"
       :class="'mb-panel-topics cell ' + this.topicPanelContainerClass"
  >
    <full-screen-topics-toggle-tab v-once
                                   v-if="!this.fullScreenTopicsOnly"
    />

    <!-- <div v-if="!shouldShowGreeting" class="topic-panel-content"> -->

    <!-- address header -->
    <div class="address-header cell small-24 medium-24"
         v-if="this.fullScreenTopicsOnly"
    >

      <div :class="'address-container columns ' +  this.addressContainerClass"
           :style="this.addressContainerStyle"
      >

        <h1 class="address-header-line-1">
          <!-- <i class="fa fa-map-marker"></i> -->
          {{ address }}
        </h1>
        <div class="address-header-line-2"
             v-show="!this.geocode"
        >

        </div>
        <div class="address-header-line-2"
             v-show="this.geocode"
        >
          PHILADELPHIA, PA {{ zipCode }}
        </div>
      </div>

      <div class="address-input-container columns small-24 medium-12 large-12"
           :style="this.addressInputContainerStyle"
           v-if="this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly"
      >
        <address-input :widthFromConfig="this.addressInputWidth"
                       :placeholder="this.addressInputPlaceholder"
        >
          <address-candidate-list v-if="this.addressAutocompleteEnabled"
                                  slot="address-candidates-slot"
                                  :widthFromConfig="this.addressInputWidth"
          />
        />
      </div>

    </div>

    <!-- before search -->
    <div v-if="shouldShowGreeting"
         class="topics-container cell medium-cell-block-y"
         :style="topicsContainerStyle"
    >
      <greeting v-show="shouldShowGreeting" />
    </div>

    <div v-if="!shouldShowGreeting" class="topic-panel-content">

      <div class="address-header cell small-24 medium-24"
           v-if="!this.fullScreenTopicsOnly"
      >

        <div :class="'address-container columns ' +  this.addressContainerClass"
             :style="this.addressContainerStyle"
        >

          <h1 class="address-header-line-1">
            <i class="fa fa-map-marker"></i>
            {{ address }}
          </h1>
          <div class="address-header-line-2">PHILADELPHIA, PA {{ zipCode }}</div>
        </div>

        <div class="address-input-container columns small-24 medium-12 large-12"
             :style="this.addressInputContainerStyle"
             v-if="this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly"
        >
          <address-input :widthFromConfig="this.addressInputWidth"
                         :placeholder="this.addressInputPlaceholder"
          >
            <address-candidate-list v-if="this.addressAutocompleteEnabled"
                                    slot="address-candidates-slot"
                                    :widthFromConfig="this.addressInputWidth"
            />
          />
        </div>

      </div>


      <!-- topics container -->
      <!-- <div class="topics-container cell medium-cell-block-y"
           :style="topicsContainerStyle"
      >
        <topic v-for="topic in this.$config.topics"
               :topicKey="topic.key"
               :key="topic.key"
        />
      </div> -->
      <!-- <div v-if="!shouldShowGreeting" -->
      <div
           class="topics-container cell medium-cell-block-y"
           :style="topicsContainerStyle"
      >
        <topic-component-group :topic-components="this.$config.components" />
      </div>


    </div>
  </div>
</template>

<script>
  import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
  const Topic = philaVueComps.Topic;
  const TopicComponentGroup = philaVueComps.TopicComponentGroup;
  const Greeting = philaVueComps.Greeting;
  const AddressInput = philaVueComps.AddressInput;
  const AddressCandidateList = philaVueComps.AddressCandidateList;
  const FullScreenTopicsToggleTab = philaVueComps.FullScreenTopicsToggleTab;


  export default {
    components: {
      Greeting,
      TopicComponentGroup,
      Topic,
      AddressInput,
      AddressCandidateList,
      FullScreenTopicsToggleTab,
    },
    data() {
      const data = {
        topicsContainerStyle: {
          'overflow-y': 'auto',
          'height': '100px',
          'min-height': '100px',
        },
        addressContainerStyle: {
          // 'height': '100%',
          'padding-bottom:': '20px',
        },
        addressInputContainerStyle: {
          // 'height': '100%',
          'align-items': 'flex-start',
          'padding-top': '20px',
        },
        addressHeaderHeightNum: null,
      };
      return data;
    },
    mounted() {
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
      // this.handleWindowResize('add5');
    },
    watch: {
      geocodeStatus() {
        this.handleWindowResize();
      }
    },
    computed: {
      shouldShowAddressHeader() {
        if (this.fullScreenTopicsOnly || this.shouldShowGreeting === false) {
          return true;
        } else {
          return false;
        }
      },
      inputAlign() {
        if (this.$config.addressInput) {
          if (this.$config.addressInput.position) {
            const position = this.$config.addressInput.position;
            switch(position) {
              case 'left':
              return 'flex-start';
              case 'right':
              return 'flex-end';
              case 'center':
              return 'center';
            }
          } else {
            return 'flex-start';
          }
        } else {
          return 'flex-start';
        }
      },
      addressInputWidth() {
        if (this.$config.addressInput) {
          return this.$config.addressInput.width;
        } else {
          return 415;
        }
      },
      addressInputPlaceholder() {
        if (this.$config.addressInput) {
          return this.$config.addressInput.placeholder;
        } else {
          return null
        }
      },
      addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressInput) {
          if (this.$config.addressInput.autocompleteEnabled === true) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      fullScreenMapEnabled() {
        return this.$store.state.fullScreenMapEnabled;
      },
      fullScreenTopicsEnabled() {
        return this.$store.state.fullScreenTopicsEnabled;
      },
      fullScreenTopicsOnly() {
        return this.$store.state.fullScreen.topicsOnly;
      },
      topicPanelContainerClass() {
        if (this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly) {
          return 'medium-24 small-order-2 medium-order-1';
        } else if (this.fullScreenMapEnabled) {
          return 'medium-1 small-order-2 medium-order-1';
        } else {
          return 'medium-12 small-order-2 medium-order-1';
        }
      },
      addressContainerClass() {
        if (this.fullScreenTopicsEnabled || this.fullScreenTopicsOnly) {
          return 'small-24 medium-12 large-12';
        } else {
          return 'small-24';
        }
      },
      geocode() {
        return this.$store.state.geocode.data;
      },
      geocodeStatus() {
        return this.$store.state.geocode.status;
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
        if (this.$config.defaultAddressTextPlaceholder) {
          address = this.$config.defaultAddressTextPlaceholder;
        }

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
      closeAddressCandidateList() {
        this.$store.state.shouldShowAddressCandidateList = false;
      },
      shouldShowTopic(topic) {
        const requiredSources = topic.dataSources || [];

        // if there aren't any required topics, show it
        if (requiredSources.length === 0) {
          return true;
        }

        const sources = this.$store.state.sources;
        return requiredSources.every(key => sources[key].data)
      },
      handleWindowResize(shouldAdd5) {
        console.log('handleWindowResize is running');

        const windowHeight = $(window).height();
        const windowWidth = $(window).width();

        const rootElement = document.getElementById('mb-root');
        const rootStyle = window.getComputedStyle(rootElement);
        const rootHeight = rootStyle.getPropertyValue('height');
        const rootHeightNum = parseInt(rootHeight.replace('px', ''));

        const siteHeader = document.getElementsByClassName('site-header')[0];
        const siteHeaderStyle = window.getComputedStyle(siteHeader);
        const siteHeaderHeight = siteHeaderStyle.getPropertyValue('height');
        const siteHeaderHeightNum = parseInt(siteHeaderHeight.replace('px', ''));

        const appFooter = document.getElementsByClassName('app-footer')[0];
        const appFooterStyle = window.getComputedStyle(appFooter);
        const appFooterHeight = appFooterStyle.getPropertyValue('height');
        const appFooterHeightNum = parseInt(appFooterHeight.replace('px', ''));

        let topicsHeight;

        if (this.shouldShowAddressHeader) {
          if (document.getElementsByClassName('address-header')[0]) {
            const addressHeader = document.getElementsByClassName('address-header')[0];
            const addressHeaderStyle = window.getComputedStyle(addressHeader);
            const addressHeaderHeight = addressHeaderStyle.getPropertyValue('height');
            let addressHeaderHeightNum = parseInt(addressHeaderHeight.replace('px', ''));
            if (shouldAdd5 === 'add5') {
              addressHeaderHeightNum = addressHeaderHeightNum + 5;
            }
            topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - addressHeaderHeightNum;
            console.log('handleWindowResize, window-width:', windowWidth, 'window-height:', windowHeight, 'rootHeight:', rootHeightNum, 'SiteHeaderHeight:', siteHeaderHeightNum, 'addressHeaderHeight:', addressHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
          } else {
            topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - 103;
            console.log('handleWindowResize, window-width:', windowWidth, 'window-height:', windowHeight, 'rootHeight:', rootHeightNum, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
          }
        } else {
          topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum;
          console.log('handleWindowResize, window-width:', windowWidth, 'window-height:', windowHeight, 'rootHeight:', rootHeightNum, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
        }

        if ($(window).width() >= 750) {
          // console.log('handleWindowResize if is running, window width is >= 750px');
          this.addressContainerStyle = {
            // 'height': '100%',
            'align-items': 'flex-start',
            'padding-bottom': '20px',
          }
          this.addressInputContainerStyle = {
            // 'height': '100%',
            'align-items': this.inputAlign,
            'padding-top': '25px',
          }

          this.topicsContainerStyle.height = topicsHeight.toString() + 'px';
          this.topicsContainerStyle['min-height'] = topicsHeight.toString() + 'px';
          this.topicsContainerStyle['overflow-y'] = 'auto';


        } else {
          this.addressContainerStyle = {
            // 'height': 'auto',
            'align-items': 'center',
            'padding-bottom': '20px',
          }
          this.addressInputContainerStyle = {
            // 'height': 'auto',
            'align-items': 'center',
            'padding-top': '5px',
          }
          // console.log('handleWindowResize lse is running, window width is < 750px');
          this.topicsContainerStyle.height = 'auto';
          this.topicsContainerStyle['min-height'] = topicsHeight.toString() + 'px';
          this.topicsContainerStyle['overflow-y'] = 'hidden';
        }
      }
    }
  };
</script>

<style scoped>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  /* standards applies padding to buttons, which causes some weirdness with
  buttons on the map panel. override here. */
  button {
    padding: inherit;
  }

  .mb-panel-topics {
    position: relative;
  }

  .address-header {
    background: #daedfe;
    color: #0f4d90;

    /*this keeps the box shadow over the scrollable part of the panel*/
    position: relative;
    z-index: 1;

    -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    margin-bottom: -5px !important;
    display: inline-block;
  }

  .address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
    padding: 0px !important;
  }

  .address-header-line-2 {
    padding: 0px;
  }

  .address-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .address-input-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 33px;
    padding-bottom: 33px;
  }

  .topics-container {
    padding: 26px;
    overflow-x: hidden;
    position: relative;
  }

  @media screen and (min-width: 40em) {
    .topics-container {
      /* height: 100%; */
      /* height: calc(100vh - 210px); */
    }
  }

</style>
