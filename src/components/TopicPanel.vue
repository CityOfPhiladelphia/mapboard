<template>
  <div id="topic-panel-container"
       :class="'mb-panel-topics cell ' + this.topicPanelContainerClass"
  >
    <full-screen-topics-toggle-tab v-once
                                   v-if="!this.fullScreenTopicsOnly"
    />

    <!-- address header - it only shows if the app is set to "fullScreenTopicsOnly" or there is a geocode -->
    <div class="address-header cell small-24 medium-24"
         v-if="this.shouldShowAddressHeader"
    >
      <div :class="'address-container columns ' +  this.addressContainerClass"
           :style="this.addressContainerStyle"
      >

        <h1 class="address-header-line-1">
        <!-- there is no map marker if there is no map -->
          <i class="fa fa-map-marker-alt"
             v-if="!this.fullScreenTopicsOnly"
          ></i>
          {{ address }}
        </h1>
        <!-- <div class="address-header-line-2"
             v-show="!this.geocode"
        >

        </div> -->
        <div v-show="this.geocode"
             class="address-header-line-2"
        >
          PHILADELPHIA, PA {{ zipCode }}
        </div>
        <any-header v-if="this.addressHeaderAdditionalInfo"
                    :options="this.addressHeaderAdditionalHeaderOptions"
                    :slots="this.addressHeaderAdditionalHeaderSlots"
        />
          <!-- <div class="address-header-line-3"
          >
            {{ addressHeaderAdditionalInfo }}
          </div> -->
        <!-- </any-header> -->
        <!-- <div class="address-header-line-3"
             v-if="this.addressHeaderAdditionalInfo && !this.addressHeaderAdditionalHeaderOptions"
        >
          {{ addressHeaderAdditionalInfo }}
        </div> -->

      </div>

      <div class="address-input-container columns small-24 medium-12 large-12"
           :style="this.addressInputContainerStyle"
           v-if="this.fullScreenTopicsEnabled && !this.stacked || this.fullScreenTopicsOnly"
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

    <!-- after search -->
    <div v-if="!shouldShowGreeting" class="topic-panel-content">
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
  const AnyHeader = philaVueComps.AnyHeader;
  const Greeting = philaVueComps.Greeting;
  const AddressInput = philaVueComps.AddressInput;
  const AddressCandidateList = philaVueComps.AddressCandidateList;
  const FullScreenTopicsToggleTab = philaVueComps.FullScreenTopicsToggleTab;

  export default {
    components: {
      Greeting,
      TopicComponentGroup,
      Topic,
      AnyHeader,
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
          'height': '100%',
          'align-items': 'flex-start',
          'padding-left': '20px',
          'padding-top': '20px',
          'padding-bottom': '20px',
        },
        addressInputContainerStyle: {
          'height': '100%',
          'align-items': 'center',
          'padding-top': '10px',
          'padding-bottom': '10px',
        },
        stacked: false,
      };
      return data;
    },
    mounted() {
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize(25);
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
      // shouldShowAddressHeaderAdditionalInfo() {
      //   if (this.addressHeaderAdditionalHeaderOptions.headerType) {
      //     return 'anyHeader'
      //   } else if (this.addressHeaderAdditionalHeaderOptions && !this.addressHeaderAdditionalHeaderOptions.headerType) {
      //     return ''
      //   }
      // }
      addressHeaderAdditionalHeaderOptions() {
        if (this.$config.addressHeaderAdditionalInfo) {
          const ahai = this.$config.addressHeaderAdditionalInfo;
          if (ahai.options) {
            if (!ahai.options.headerType) {
              ahai.options.headerType = 'h4';
            }
            return ahai.options;
          }
        }
      },
      addressHeaderAdditionalHeaderSlots() {
        return {
          text: this.addressHeaderAdditionalInfo
        }
      },
      addressHeaderAdditionalInfo() {
        if (this.$config.addressHeaderAdditionalInfo) {
          const geocode = this.geocode;
          if (!geocode) return null;
          const ahai = this.$config.addressHeaderAdditionalInfo;
          let returned = [];
          if (ahai.preText) {
            returned.push(ahai.preText);
          }
          returned.push(geocode.properties[ahai.data]);
          console.log('returned:', returned);
          return returned.join(' ');
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
      handleWindowResize(pixelAdjustment) {
        // this is called to run when:
        // 1 - TopicPanel.vue mounted
        // 2 - geocodeStatus change
        // 3 - any resizing of the window

        // const windowHeight = $(window).height();
        const windowHeight = window.innerHeight;
        // const siteHeaderHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('site-header')[0]).getPropertyValue('height').replace('px', ''));
        const siteHeaderHeightNum = parseInt(document.getElementsByClassName('site-header')[0].getBoundingClientRect().height);
        // const appFooterHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('app-footer')[0]).getPropertyValue('height').replace('px', ''));
        const appFooterHeightNum = parseInt(document.getElementsByClassName('app-footer')[0].getBoundingClientRect().height);
        let topicsHeight;

        if (this.shouldShowAddressHeader) {
          if (document.getElementsByClassName('address-header')[0]) {
            // const addressHeaderHeightNum = parseInt(window.getComputedStyle(document.getElementsByClassName('address-header')[0]).getPropertyValue('height').replace('px', ''));
            const addressHeaderHeightNum = parseInt(document.getElementsByClassName('address-header')[0].getBoundingClientRect().height);
            topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - addressHeaderHeightNum;
            // console.log('handleWindowResize shouldShowAddressHeader and it was found, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'addressHeaderHeight:', addressHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
            if (typeof pixelAdjustment === 'number') {
              // console.log('handleWindowResize if pixelAdjustment is true, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'addressHeaderHeight:', addressHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight, 'pixelAdjustment:', pixelAdjustment);
              topicsHeight = topicsHeight - pixelAdjustment;
            }
          } else {
            topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum - 103;
            // console.log('handleWindowResize shouldShowAddressHeader but it was not found so it is using the hardcoded 103, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
          }
        } else {
          topicsHeight = windowHeight - siteHeaderHeightNum - appFooterHeightNum;
          // console.log('handleWindowResize shouldShowAddressHeader is NOT true, window-height:', windowHeight, 'SiteHeaderHeight:', siteHeaderHeightNum, 'appFooterHeight:', appFooterHeightNum, 'topicsHeight:', topicsHeight);
        }

        // if ($(window).width() >= 750) {
        if (window.innerWidth >= 750) {
          this.stacked = false;
          this.addressContainerStyle = {
            'height': '100%',
            'align-items': 'flex-start',
            'padding-left': '20px',
            'padding-top': '20px',
            'padding-bottom': '20px',
          }
          this.addressInputContainerStyle = {
            'height': '100%',
            'align-items': this.inputAlign,
            'padding-top': '30px',
            'padding-bottom': '30px',
          }
          this.topicsContainerStyle.height = topicsHeight.toString() + 'px';
          this.topicsContainerStyle['min-height'] = topicsHeight.toString() + 'px';
          this.topicsContainerStyle['overflow-y'] = 'auto';

        } else {
          this.stacked = true;
          this.addressContainerStyle = {
            'height': 'auto',
            'align-items': 'center',
            'padding-left': '0px',
            'padding-top': '10px',
            'padding-bottom': '10px',
          }
          this.addressInputContainerStyle = {
            'height': 'auto',
            'align-items': 'center',
            'padding-top': '10px',
            'padding-bottom': '10px',
          }
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

  .address-header-line-3 {
    padding: 0px;
  }

  .address-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .address-input-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .topics-container {
    padding: 26px;
    position: relative;
    overflow-x: hidden;
  }

</style>
